"use strict";

var path = require('path');
var fs = require('fs');
var util = require('util');
var events = require('events');
var semver = require('semver');
var Logger = require('./Logger');

function processDir(dirPath,regex,result) {

    var files = fs.readdirSync(dirPath);
    for(var i=0; i<files.length; i++) {

        var currPath = files[i];
        currPath = path.join(dirPath,currPath);

        var stats = fs.statSync(currPath);
        if(stats.isDirectory()) {
            Logger.info('handling dir: '+currPath);
            processDir(currPath,regex,result);
        } else {
            Logger.info('handling file: '+currPath);

            if(currPath.match(regex)) {
                result.push(currPath);
            }
        }
    }
}

/**
 * Recursively searches for files at the provided directory path matching the
 * provided regular expression.
 * @param {string} startPath Start of the directory recursion path
 * @param {regex} regex Optional regular expression of the file names to match
 * @return An array of relative paths to all files found at startPath that
 * match the provided regular expression.
 *
 * Example:
 *
 *   var files = listFiles('./test',/^.*Tests.js$/);
 *
 * This might return an array like this:
 *
 * ['test/core/helper/MemcachedClientTests.js','test/core/helper/MongoDataServiceTests.js','test/core/helper/ValidateTests.js','test/model/DocumentTreeTests.js']
 */
exports.listFiles = function(startPath,regex) {

    var stats = fs.statSync(startPath);

    if(!(stats && stats.isDirectory())) {
        throw new Error('Invalid directory path: '+startPath);
    }

    var result = [];
    processDir(startPath,regex,result);
    return result;
};

/**
 * Synchronous implementation of 'mkdir -p'.
 */
exports.mkdirpSync = function(p,mode) {

    mode = mode || parseInt('0755',8);
    p = path.resolve(p);
    var ps = path.normalize(p).split('/');
    fs.existsSync = semver.lt(process.version, '0.8.0') ? require('path').existsSync : fs.existsSync;
    if(fs.existsSync(p)) return;
    exports.mkdirpSync(ps.slice(0,-1).join('/'), mode);
    fs.mkdirSync(p,mode);
};

/**
 * @return {boolean} true if aPath points to an actual directory, false otherwise.
 */
exports.isDirectorySync = function(aPath) {

    var stats = undefined;
    try {
        stats = fs.statSync(aPath);
    } catch(e) {
        if(e.code !== 'ENOENT') {
            throw e;
        }
    }

    if(stats) {
        return stats.isDirectory();
    }
    return false;
};

/**
 * Async directory check.
 * @param aPath The path to check.
 * @param cb Callback function to be called as: cb(err,boolean)
 */
exports.isDirectory = function(dirpath,cb) {

    fs.stat(dirpath, function(err,stats) {

        if(err&&err.code!=='ENOENT') {
            cb(err);
            return;
        }
        if(!stats) { cb(null,false); return; }
        cb(null,stats.isDirectory());
    });
};

/**
 * @return {boolean} true if aPath points to an actual file, false otherwise.
 */
exports.isFileSync = function(aPath) {

    var stats = null;
    try {
        stats = fs.statSync(aPath);
    } catch(e) {
        if(e.code !== 'ENOENT') {
            throw e;
        }
    }
    return stats && stats.isFile();
};

/**
 * Async file check.
 * @param aPath The path to check.
 * @param cb Callback, will be called as cb(err,boolean).
 */
exports.isFile = function(aPath,cb) {

    fs.stat(aPath, function(err,stats) {

        if(err&&err.code!=='ENOENT') {
            cb(err);
            return;
        }
        if(!stats) { cb(null,false); return; }
        cb(null,stats.isFile());
    });
};

exports.exists = semver.lt(process.version, '0.8.0') ? require('path').exists : fs.exists;
exports.existsSync = semver.lt(process.version, '0.8.0') ? require('path').existsSync : fs.existsSync;

function DirCopySync() {
    events.EventEmitter.call(this);
}
util.inherits(DirCopySync,events.EventEmitter);

/**
 * Performs a recursive copy of a directory and all of its contents to a second directory
 * preserving directory structure.
 *
 * @param srcDir {string} The source directory to copy. Must exist.
 * @param dstDir {string} The destination directory. Must exist unless options.createDstDir is true.
 * @param options.createDstDir {boolean} Flag to enable creation of the dstDir if it does not exist.
 * @param options.filters {object} An object with two possible properties described below.
 * @param options.filters.nameFilter {function} A function(origFilenameStr) that returns a
 * transformed version of the provided original filename string. This allows you to rename files according
 * to a rule as they are copied from srcDir to dstDir.
 * @param options.contentFilters {array} An array of function(origContentStr) that resutns a transformed
 * version of the provided file content. This allows you to manipulate the contents of files as you they
 * move from srcDir to dstDir.
 * @example
 * var filters = [
 *    function(srcStr) { return srcStr.replace('badWord',srcStr); },
 *    function(srcStr) { return srcStr.toUpperCase(); }
 * ];
 *
 * function nameFilterFn(str) { return str.toUpperCase(); };
 *
 * dirCopySync = new DirCopySync();
 *
 * this.dirCopySync.on('newdir',function(dirPath) {
 *    Logger.info('CREATE DIR: '+dirPath);
 * });
 * this.dirCopySync.on('newfile',function(filePath) {
 *    Logger.info('    CREATE: '+filePath);
 * });
 *
 * // Handle any template items for this new directory.
 * dirCopySync.copy(mySrcPath,myDstPath,{createDstDir:true,filters:{nameFilter:nameFilterFn,contentFilters:filers}});
 *
 */
DirCopySync.prototype.copy = function(srcDir,dstDir,options) {

    var self = this;
    var opts = options || {};

    if(!exports.isDirectorySync(srcDir)) {
        throw new Error('Invalid srcDir: '+srcDir);
    }
    if(!exports.isDirectorySync(dstDir)) {

        if(!opts.createDstDir) {
            throw new Error('Invalid dstDir: '+dstDir);
        } else {
            dstDir = path.resolve(dstDir);
            fs.mkdirSync(dstDir,parseInt('0775',8));
        }
    }

    var fileFilters = opts.filters || {};

    // Handle any template items for this new directory.
    var dirContents = fs.readdirSync(srcDir);
    dirContents.forEach(function(currItem) {
        self._handleItem(srcDir,dstDir,'',currItem,fileFilters);
    });
};

DirCopySync.prototype._handleItem = function(srcPath,dstPath,parentPath,fileOrDir,fileFilters) {

    var self = this;
    var itemPath = path.join(srcPath,parentPath,fileOrDir);
    if(exports.isDirectorySync(itemPath)) {

        // Create the specified directory.
        var newDirPath = path.join(parentPath,fileOrDir);
        exports.mkdirpSync(path.join(dstPath,newDirPath),parseInt('0755',8));
        this.emit('newdir',path.join(dstPath,newDirPath));

        // Handle the items in this new directory.
        var dirContents = fs.readdirSync(path.join(srcPath,newDirPath));
        dirContents.forEach(function(currItem) {
            self._handleItem(srcPath,dstPath,newDirPath,currItem,fileFilters);
        });

    } else {
        self._handleFile(srcPath,dstPath,parentPath,fileOrDir,fileFilters);
    }
};

DirCopySync.prototype._handleFile = function(srcPath,dstPath,parentPath,fileName,fileFilters) {

    var srcFilePath = path.join(srcPath,parentPath,fileName);
    var srcFileContents = fs.readFileSync(srcFilePath,'utf8');
    var dstFilename = fileName;

    // Apply the filename filter, if one was provided.
    var fileNameFilterFn = fileFilters.nameFilter;
    if('function'===typeof(fileNameFilterFn)) {
        dstFilename = fileNameFilterFn.apply(new Object(),[fileName]);
    }

    // Apply each content filter.
    fileFilters.contentFilters.forEach(function(currFilterFn) {
        srcFileContents = currFilterFn.apply(new Object(),[srcFileContents]);
    });

    var dstFilePath = path.join(dstPath,parentPath,dstFilename);
    this.emit('newfile',dstFilePath);
    fs.writeFileSync(dstFilePath,srcFileContents,'utf8');
};

/**
 * From a file path, get the file name. Warning: assumes '/' as a file separator.
 * @param {string} path The file name with a path and file name.
 * @returns {boolean|string} The file name. Or false, if there was a failure.
 */
exports.getFileFromFileName = function(path) {

    if (typeof path !== 'string')
        return false;

    var temp = path.split('/');
    var file = temp.pop();
    return  file.length ? file : false;
};

/**
 * From a qualified file name, get the path without the file name. Warning:
 * assumes a '/' as a separator.
 * @param {string} path The filename with path.
 * @returns {string|boolean} Returns the path if successful or false upon failure.
 */
exports.getPathFromFileName = function(path) {

    if (typeof path !== 'string')
        return false;

    var temp = path.split('/');
    var file = temp.pop();
    temp.push('');
    return  temp.join('/');
};

/**
 * Will add the suffix text to the end of the file name just to the
 * left of the '.' denoting the start of hte file extension. This function
 * fails if there is no extension, but in that case, you don't need this.
 * @param {string} filename The name of the file with an extension.
 * @param {string} suffix The text you want to insert at the end of the filename.
 * @return {false|string} The filename with the suffix in the correct place. False is
 *   returned on failure.
 */
exports.addSuffixToFileName = function(filename, suffix) {

    if (typeof filename !== 'string' || typeof suffix !== 'string')
        return false;

    if (filename.length < 2 || suffix.length === 0)
        return false;

    var extPos = filename.lastIndexOf('.');
    if (extPos < 0)
        return false;

    filename = filename.substr(0, extPos) + suffix + filename.substr(extPos);
    return filename;
};

exports.DirCopySync = DirCopySync;
