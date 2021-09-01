const NodeID3 = require('node-id3')


var writeTags = (file, tags, cb) => {
    return NodeID3.update(tags, file, cb)
}
var readTags = (file, cb) => {
    return NodeID3.read(file, cb)
}

module.exports = {
    writeTags,
    readTags
}