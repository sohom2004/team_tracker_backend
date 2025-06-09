const jwt = require("jsonwebtoken");
const db = require("../db/db");

const getUserProfile = (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  // Decode without verifying
  const decoded = jwt.decode(token);

  if (!decoded || !decoded.id) {
    return res.status(400).json({ message: "Invalid token payload" });
  }

  const userId = decoded.id;

  const query = "SELECT * FROM users WHERE id = ?";

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user details:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(results[0]);
  });
};

const updateUserStatus = (req, res) => {
  const { email, status } = req.body;
  if (!email || !status) {
    return res.status(400).json({ message: "Email and status are required" });
  }

  const query = "UPDATE users SET status = ? WHERE email = ?";
  db.query(query, [status, email], (err, result) => {
    if (err) {
      console.error("Error updating status:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Status updated successfully" });
  });
};

const getUserStatuses = (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  // Decode without verifying
  const decoded = jwt.decode(token);

  if (!decoded || !decoded.id) {
    return res.status(400).json({ message: "Invalid token payload" });
  }

  const userId = decoded.id;

  const query = `
    SELECT id, status, start_date, end_date, start_time, end_time, description
    FROM user_statuses
    WHERE user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user statuses:", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(results);
  });
};

const addUserStatus = (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  const decoded = jwt.decode(token);

  if (!decoded || !decoded.id) {
    return res.status(400).json({ message: "Invalid token payload" });
  }

  const userId = decoded.id;
  const { startDate, endDate, startTime, endTime, status, description } = req.body;

  if (!startDate || !endDate || !status) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const insertQuery = `
    INSERT INTO user_statuses 
    (user_id, status, start_date, end_date, start_time, end_time, description) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    insertQuery,
    [userId, status, startDate, endDate, startTime || null, endTime || null, description || null],
    (err, result) => {
      if (err) {
        console.error("Error inserting status:", err);
        return res.status(500).json({ message: "Database error" });
      }

      // Now immediately check if the current datetime falls within this new status range
      const now = new Date();
      const currentDate = now.toISOString().split("T")[0];
      const currentTime = now.toTimeString().split(" ")[0];

      const shouldApplyStatus =
        startDate <= currentDate &&
        endDate >= currentDate &&
        (
          (!startTime && !endTime) || 
          (startTime <= currentTime && endTime >= currentTime)
        );

      if (shouldApplyStatus) {
        db.query(
          `UPDATE users SET status = ? WHERE id = ?`,
          [status, userId],
          (updateErr) => {
            if (updateErr) {
              console.error("Error updating immediate status after add:", updateErr);
              // Still return 201 even if update fails
              return res.status(201).json({
                message: "Status added, but failed to update current user status",
                statusId: result.insertId
              });
            }

            return res.status(201).json({
              message: "Status added and current user status updated",
              statusId: result.insertId
            });
          }
        );
      } else {
        // If not within current time range, just respond success
        return res.status(201).json({
          message: "Status added successfully",
          statusId: result.insertId
        });
      }
    }
  );
};


const getLiveStatus = (req, res) => {
  const { email } = req.params;
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  db.query(
    `SELECT us.status, u.id AS user_id
     FROM user_statuses us
     JOIN users u ON us.user_id = u.id
     WHERE u.email = ?
       AND (
         (us.start_date <= CURDATE() AND us.end_date >= CURDATE())
         AND (
           ((us.start_time IS NULL OR us.start_time = '') AND (us.end_time IS NULL OR us.end_time = ''))
           OR (
             CONCAT(CURDATE(), ' ', CURTIME())
             BETWEEN CONCAT(us.start_date, ' ', us.start_time)
             AND CONCAT(us.end_date, ' ', us.end_time)
           )
         )
       )
     ORDER BY us.start_date DESC, us.start_time DESC
     LIMIT 1`,
    [email],
    (err, result) => {
      if (err) {
        console.error("Error checking live status:", err);
        return res.status(500).json({ message: "Database error." });
      }

      if (result.length > 0) {
        const { status, user_id } = result[0];

        // Update the user's status in the users table
        db.query(
          `UPDATE users SET status = ? WHERE id = ?`,
          [status, user_id],
          (updateErr) => {
            if (updateErr) {
              console.error("Error updating user status:", updateErr);
              // Return 500 here or continue returning status anyway?
              // Here we continue returning status to avoid blocking the client.
            }

            // Send the status in response regardless of update success
            return res.status(200).json({ status });
          }
        );
      } else {
        // If no status found, set default 'Available' in users table as well
        db.query(
          `UPDATE users SET status = 'Available' WHERE email = ?`,
          [email],
          (updateErr) => {
            if (updateErr) {
              console.error("Error setting default user status:", updateErr);
            }
            return res.status(200).json({ status: "Available" });
          }
        );
      }
    }
  );
};


module.exports = { getUserProfile, updateUserStatus, getUserStatuses, addUserStatus, getLiveStatus };
