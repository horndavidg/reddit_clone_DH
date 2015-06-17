var mongoose = require("mongoose");
var Comment = require("./comment");

var postSchema = new mongoose.Schema({
                    title: String,
                    summary: String,
                    link: String,
                    comments: [{
                      type: mongoose.Schema.Types.ObjectId,
                      ref: "Comment"
                    }]
                  });

// need to add in a tag to the user id for association!


postSchema.pre('remove', function(next) {
    Comment.remove({post: this._id}).exec();
    next();
});

var Post = mongoose.model("Post", postSchema);

module.exports = Post;