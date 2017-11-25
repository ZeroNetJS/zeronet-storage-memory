'use strict'

function FSMock (store) {
  const self = this
  self.exists = (file, cb) => cb(null, Boolean(store[file]))
  self.readFile = (file, cb) => store[file] ? cb(null, store[file]) : cb(new Error('ENOTFOUND: ' + file))
  self.writeFile = (file, data, cb) => cb(null, (store[file] = data))
  self.unlink = (file, cb) => store[file] ? cb(null, delete store[file]) : cb(new Error('ENOTFOUND: ' + file))
}

module.exports = function ZeroNetStorageFS () {
  // store stuff in memory

  const self = this

  let json, file, fs, jfs

  const getPath = (a, b) => a + '/' + b

  self.file = {
    exists: (zite, version, innerPaath, cb) => fs.exists(getPath(zite, innerPaath), cb),
    read: (zite, version, innerPaath, cb) => fs.readFile(getPath(zite, innerPaath), cb),
    write: (zite, version, innerPaath, data, cb) => fs.writeFile(getPath(zite, innerPaath), data, cb),
    remove: (zite, version, innerPaath, cb) => fs.unlink(getPath(zite, innerPaath), cb)
  }

  self.json = {
    exists: (key, cb) => jfs.exists(getPath('json', key), res => cb(null, res)),
    read: (key, cb) => jfs.readFile(getPath('json', key), cb),
    write: (key, data, cb) => jfs.writeFile(getPath('json', key), data, cb),
    remove: (key, cb) => jfs.unlink(getPath('json', key), cb)
  }

  self.start = cb => {
    json = {}
    jfs = new FSMock(json)
    file = {}
    fs = new FSMock(file)
    self.mocks = {
      fs,
      jfs,
      json,
      file
    }
    cb()
  }

  self.stop = cb => {
    json = null
    jfs = null
    file = null
    fs = null
    self.mocks = null
    cb()
  }
}
