var mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
                    name: String,
                    content: String,
                    ownerId: String,
                    post: {
                      type: mongoose.Schema.Types.ObjectId,
                      ref: "Post"
                    }
                  });

// need to add in a tag to the user id for association!


var Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;