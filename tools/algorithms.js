/**
 * *Algorithm to get hot posts, customized to the user currently logged in.
 * *Things to take into account:
 *      *User's spaces
 *      *Post's tags
 *      *Post's publication date
 *      *Post's likes
 */
const User = require('../models/userModel');
const Post = require('../models/postModel');

module.exports = {
  getHotPosts: async (req, res, next) => {
    const user = await User.findById(req.user.id); //Find user. User must be logged in for this to work
    const userSpaces = user.spaces; //Fetch user's spaces
    const bestMatches = [];
    Post.find()
      .stream()
      .on('data', (doc) => {
        const filteredArray = userSpaces.filter((value) =>
          doc.tags.includes(value)
        );
        const val = filteredArray.length;
        bestMatches.push({
          id: doc._id,
          matches: val,
          timestamp: doc.date,
          likes: doc.likes,
        });
      })
      .on('error', (err) => {
        res.status(500).json({
          status: 'failed',
          data: {
            message: `Internal server error: ${err}`,
          },
        });
      })
      .on('end', () => {
        //Cut the object so it only contains articles published in the last business week
        const currentTime = new Date().getTime();
        bestMatches.filter(
          (match) => currentTime - match.timestamp.getTime() > 432000000
        );
        //sort by matches first. If matches are equal, sort by likes. If likes are equal, sort by most recent.
        //TODO: Refactor this code. Nesting ternary operators is bad practice

        bestMatches.sort(
          (a, b) =>
            b.matches - a.matches ||
            b.likes - a.likes ||
            b.timestamp.getTime() - a.timestamp.getTime()
        );
        res.status(200).json({
          status: 'success',
          length: bestMatches.length,
          data: {
            message: 'All done!',
            bestMatches,
          },
        });
      });
  },
};
