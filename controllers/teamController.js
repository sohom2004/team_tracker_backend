const db = require("../db/db");

// Create a new team and assign it to the user
const createTeam = (req, res) => {
  const { team_name, user_id } = req.body;

  if (!team_name || !user_id) {
    return res.status(400).json({ message: "Team name and user ID are required." });
  }

  // 1️⃣ Check if user exists and is already in a team
  db.query(
    "SELECT team FROM users WHERE id = ?",
    [user_id],
    (err, userRows) => {
      if (err) {
        console.error("Error fetching user:", err);
        return res.status(500).json({ message: "Database error." });
      }

      if (userRows.length === 0) {
        return res.status(404).json({ message: "User not found." });
      }

      if (userRows[0].team !== '?') {
        return res.status(400).json({ message: "User is already part of a team." });
      }

      // 2️⃣ Insert new team into teams table
      db.query(
        "INSERT INTO teams (team_name) VALUES (?)",
        [team_name],
        (err, teamResult) => {
          if (err) {
            console.error("Error creating team:", err);
            return res.status(500).json({ message: "Database error." });
          }

          const newTeamId = teamResult.insertId;

          // 3️⃣ Update user's team column with the new team_id
          db.query(
            "UPDATE users SET team = ? WHERE id = ?",
            [newTeamId, user_id],
            (err, updateResult) => {
              if (err) {
                console.error("Error updating user team:", err);
                return res.status(500).json({ message: "Database error." });
              }

              // 4️⃣ Respond success
              res.status(201).json({
                message: "Team created successfully and user added to the team.",
                team_id: newTeamId,
              });
            }
          );
        }
      );
    }
  );
};

const searchTeams = (req, res) => {
  const { query, user_id } = req.body;

  if (!query) {
    return res.status(400).json({ message: "Search query is required." });
  }

  // Optionally: Use user_id here if needed for validations/logs

  db.query(
    "SELECT * FROM teams WHERE team_name LIKE ?",
    [`%${query}%`],
    (err, teamRows) => {
      if (err) {
        console.error("Error searching teams:", err);
        return res.status(500).json({ message: "Database error while searching teams." });
      }

      res.status(200).json(teamRows);
    }
  );
};

const joinTeam = (req, res) => {
  const { team_id, user_id } = req.body;

  if (!team_id || !user_id) {
    return res.status(400).json({ message: "Team ID and user ID are required." });
  }

  // 1️⃣ Check if user exists and is already in a team
  db.query(
    "SELECT team FROM users WHERE id = ?",
    [user_id],
    (err, userRows) => {
      if (err) {
        console.error("Error fetching user:", err);
        return res.status(500).json({ message: "Database error." });
      }

      if (userRows.length === 0) {
        return res.status(404).json({ message: "User not found." });
      }

      if (userRows[0].team !== '?') {
        return res.status(400).json({ message: "User is already part of a team." });
      }

      // 2️⃣ Check if the team exists
      db.query(
        "SELECT * FROM teams WHERE team_id = ?",
        [team_id],
        (err, teamRows) => {
          if (err) {
            console.error("Error fetching team:", err);
            return res.status(500).json({ message: "Database error." });
          }

          if (teamRows.length === 0) {
            return res.status(404).json({ message: "Team not found." });
          }

          // 3️⃣ Update user's team column with the team_id
          db.query(
            "UPDATE users SET team = ? WHERE id = ?",
            [team_id, user_id],
            (err, updateResult) => {
              if (err) {
                console.error("Error updating user team:", err);
                return res.status(500).json({ message: "Database error." });
              }

              // 4️⃣ Respond success
              res.status(200).json({
                message: "Successfully joined the team.",
                team_id: team_id,
              });
            }
          );
        }
      );
    }
  );
};

const getTeamMembers = (req, res) => {
  const { team_id } = req.params;

  if (!team_id) {
    return res.status(400).json({ message: "Team ID is required." });
  }

  db.query(
    "SELECT full_name, role, status FROM users WHERE team = ?",
    [team_id],
    (err, results) => {
      if (err) {
        console.error("Error fetching team members:", err);
        return res.status(500).json({ message: "Database error." });
      }

      res.status(200).json(results);
    }
  );
};

const leaveTeam = (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: "User ID is required." });
  }

  // 1️⃣ Check if user exists and is in a team
  db.query(
    "SELECT team FROM users WHERE id = ?",
    [user_id],
    (err, userRows) => {
      if (err) {
        console.error("Error fetching user:", err);
        return res.status(500).json({ message: "Database error." });
      }

      if (userRows.length === 0) {
        return res.status(404).json({ message: "User not found." });
      }

      if (userRows[0].team === '?') {
        return res.status(400).json({ message: "User is not part of any team." });
      }

      // 2️⃣ Update user's team column to '?'
      db.query(
        "UPDATE users SET team = ? WHERE id = ?",
        ['?', user_id],
        (err, updateResult) => {
          if (err) {
            console.error("Error removing user from team:", err);
            return res.status(500).json({ message: "Database error." });
          }

          // 3️⃣ Respond success
          res.status(200).json({ message: "Successfully left the team." });
        }
      );
    }
  );
};

module.exports = { createTeam, searchTeams, joinTeam, getTeamMembers, leaveTeam };
