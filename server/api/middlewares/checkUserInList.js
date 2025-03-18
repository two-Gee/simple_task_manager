const { db } = require("../../initializeDatabase");

const checkUserInList = (req, res, next) => {
  const userId = req.headers["userid"];
  const { listId } = req.params;

  db.get("SELECT * FROM listUsers WHERE listId = ? AND userId = ?", [listId, userId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(403).json({ message: "User not authorized for this list" });
    }
    next();
  });
};

module.exports = checkUserInList;
