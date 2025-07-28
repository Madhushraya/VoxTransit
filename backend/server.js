const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Create a Connection Pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Shraya@17', // Change if needed
  database: 'dbms',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// GET ROUTES - For dropdowns and data retrieval
app.get('/countUsers', async (req, res) => {
  try {
    const [results] = await pool.query("SELECT COUNT(*) AS count FROM UserTable");
    res.json(results);
  } catch (error) {
    console.error("Database Query Error:", error);
    res.status(500).json({ error: "Database Query Failed" });
  }
});

app.get('/COST', async (req, res) => {
  try {
    const [results] = await pool.query("CALL totalrevenue()");
    res.json(results);
  } catch (error) {
    console.error("Database Query Error:", error);
    res.status(500).json({ error: "Database Query Failed" });
  }
});

// Get Bus Stops
app.get('/BusStops', async (req, res) => {
  try {
    const [results] = await pool.query("SELECT DISTINCT IntermediateStops FROM BusStops");
    res.json(results.map(row => row.IntermediateStops));
  } catch (error) {
    console.error("🔥 BusStops Query Error:", error);
    res.status(500).json({ error: "Database Query Failed" });
  }
});

// Get Route IDs
app.get('/RouteId', async (req, res) => {
  try {
    const [results] = await pool.query("SELECT DISTINCT RouteId FROM RouteDetails");
    console.log("✅ RouteIds Fetched:", results); // Debugging log
    res.json(results.map(row => row.RouteId.toString()));
  } catch (error) {
    console.error("🔥 RouteId Query Error:", error);
    res.status(500).json({ error: "Database Query Failed" });
  }
});

// Get Bus Agencies
app.get('/Agencies', async (req, res) => {
  try {
    const [results] = await pool.query("SELECT DISTINCT AgencyName FROM AgencyDetails");
    console.log("✅ Agencies Fetched:", results); // Debugging log
    res.json(results.map(row => row.AgencyName));
  } catch (error) {
    console.error("🔥 Agencies Query Error:", error);
    res.status(500).json({ error: "Database Query Failed" });
  }
});

// Get all drivers
app.get('/drivers', async (req, res) => {
  try {
    const [results] = await pool.query("SELECT DriverID FROM DriverDetails");
    console.log("✅ Drivers Fetched:", results); // Debugging log
    res.json(results.map(row => row.DriverID));
  } catch (error) {
    console.error("🔥 Drivers Query Error:", error);
    res.status(500).json({ error: "Failed to fetch drivers" });
  }
});

// Get all buses
app.get('/buses', async (req, res) => {
  try {
    const [results] = await pool.query("SELECT BusRegnNo FROM BusInfo");
    console.log("✅ Buses Fetched:", results); // Debugging log
    res.json(results.map(row => row.BusRegnNo));
  } catch (error) {
    console.error("🔥 Buses Query Error:", error);
    res.status(500).json({ error: "Failed to fetch buses" });
  }
});

// Get Available Buses for a specific route
app.get('/fetchBuses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Fetching Buses for RouteID: ${id}`);
    const query = `SELECT * FROM BusSchedule NATURAL JOIN BusInfo WHERE RouteID = ?`;
    const [results] = await pool.query(query, [id]);
    res.json(results);
  } catch (error) {
    console.error("🔥 Fetch Buses Error:", error);
    res.status(500).json({ error: "Database Query Failed" });
  }
});

// Search buses by location - NEW ENDPOINT
app.get('/searchBusesByLocation/:location', async (req, res) => {
  try {
    const { location } = req.params;
    console.log(`🔍 Searching buses for location: ${location}`);
    
    // This query finds buses that pass through the specified location
    const query = `
      SELECT bs.BusRegnNo, bs.RouteID, bs.StartTime, bs.Fare, bs.TravelTime, 
             bi.BusType, rd.Source, rd.Destination 
      FROM BusSchedule bs
      JOIN BusInfo bi ON bs.BusRegnNo = bi.BusRegnNo
      JOIN RouteDetails rd ON bs.RouteID = rd.RouteID
      WHERE bs.RouteID IN (
        SELECT DISTINCT RouteId FROM BusStops 
        WHERE IntermediateStops = ?
      )`;
    
    const [results] = await pool.query(query, [location]);
    
    if (results.length > 0) {
      res.json(results);
    } else {
      res.json({ message: 'No buses found for this location' });
    }
  } catch (error) {
    console.error("🔥 Search Buses by Location Error:", error);
    res.status(500).json({ error: "Failed to search buses by location" });
  }
});

// POST ROUTES - For form submissions and data processing
// Check booked seats
app.post('/BookedSeats', async (req, res) => {
  try {
    const { traveldate, busregnno } = req.body;
    const tdate = new Date(traveldate);
    const formattedDate = `${tdate.getFullYear()}-${tdate.getMonth() + 1}-${tdate.getDate() + 1}`;
    console.log(`🔍 Checking booked seats for Bus: ${busregnno} on Date: ${formattedDate}`);
    const query = `SELECT BookedSeats FROM Ticket NATURAL JOIN SeatsBooked WHERE TravelDate = ? AND BusRegnNo = ?`;
    const [results] = await pool.query(query, [formattedDate, busregnno]);
    res.json(results.map(row => row.BookedSeats.toString()));
  } catch (error) {
    console.error("🔥 Booked Seats Error:", error);
    res.status(500).json({ error: "Database Query Failed" });
  }
});

// Book tickets
app.post('/Tickets', async (req, res) => {
  try {
    const { routeid, busregnno, traveldate } = req.body;
    const bookingDate = new Date().toISOString().split('T')[0];
    const travelDateFormatted = new Date(traveldate).toISOString().split('T')[0];
    console.log(`🚌 Booking Ticket for Bus: ${busregnno} | Travel Date: ${travelDateFormatted}`);
    const insertQuery = `INSERT INTO Ticket (BusRegnNo, BookingDate, TravelDate) VALUES (?, ?, ?)`;
    await pool.query(insertQuery, [busregnno, bookingDate, travelDateFormatted]);
    const [ticketResult] = await pool.query("SELECT MAX(TicketPNR) AS TicketPNR FROM Ticket");
    res.json({ pnr: ticketResult[0].TicketPNR });
  } catch (error) {
    console.error("🔥 Ticket Booking Error:", error);
    res.status(500).json({ error: "Ticket Booking Failed" });
  }
});

// Book seats
app.post('/SeatsBooking', async (req, res) => {
  try {
    const { pnr, seatsbooked } = req.body;
    let errorFlag = false;
    for (const seat of seatsbooked) {
      try {
        await pool.query("INSERT INTO SeatsBooked VALUES (?, ?)", [pnr, seat]);
      } catch (err) {
        console.error("🔥 SeatsBooking Error:", err);
        errorFlag = true;
      }
    }
    res.json({ res: "", error: errorFlag ? "Some error" : null });
  } catch (error) {
    console.error("🔥 Seats Booking Error:", error);
    res.status(500).json({ error: "Seats Booking Failed" });
  }
});

// Admin login
app.post('/adminLogin', async (req, res) => {
  try {
    const { username, password } = req.body;
    const query = "SELECT * FROM UserTable WHERE Email = ? AND Password = ? AND Usertype = 'A'";
    const [results] = await pool.query(query, [username, password]);
    res.json(results.length > 0 ?
      { error: '', response: 'success' } :
      { error: 'No Such User Exists', response: 'fail' });
  } catch (error) {
    console.error("🔥 Admin Login Error:", error);
    res.status(500).json({ error: "Database Query Failed" });
  }
});

// User login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log(`🔍 Checking login for Email: ${email}, Password: ${password}`);
    const query = "SELECT * FROM UserTable WHERE LOWER(Email) = LOWER(?)";
    const [results] = await pool.query(query, [email]);
    console.log("💡 Query Result:", results);
    if (results.length === 0) {
      return res.json({ error: 'No Such User Exists. Please Register first', response: 'fail' });
    }
    const user = results[0];
    if (user.Password !== password) {
      return res.json({ error: 'Incorrect Password', response: 'fail' });
    }
    res.json({ error: '', response: 'success' });
  } catch (error) {
    console.error("🔥 Login Query Error:", error);
    res.status(500).json({ error: "Database Query Failed" });
  }
});

// User signup
app.post('/signup', async (req, res) => {
  const { email, address, gender, phone, username, pass } = req.body;
  const userType = "NA";
  try {
    const insertUser = "INSERT INTO UserTable (email, Name, Password, UserType, Address, Phone, Gender) VALUES (?,?,?,?,?,?,?)";
    const [userResult] = await pool.query(insertUser, [email, username, pass, userType, address, phone, gender]);
    const newUserId = userResult.insertId;
    const insertNonAdmin = "INSERT INTO NonAdmin (Id, Gender, Phone, Address) VALUES (?,?,?,?)";
    await pool.query(insertNonAdmin, [newUserId, gender, phone, address]);
    res.json({ success: true, message: "User registered successfully!" });
  } catch (error) {
    console.error("Signup Query Error:", error);
    res.status(500).json({ error: "User registration failed" });
  }
});

// Check available routes
app.post('/CheckRoute', async (req, res) => {
  const { fromSelect, toSelect } = req.body;
  try {
    const query = `SELECT DISTINCT RouteId FROM BusStops
     WHERE RouteId IN (SELECT RouteId FROM BusStops
     WHERE IntermediateStops = ?
     AND RouteId IN (SELECT RouteId FROM BusStops WHERE IntermediateStops = ?))`;
    const [results] = await pool.query(query, [fromSelect, toSelect]);
    if (results.length > 0) {
      res.json({ error: '', response: results.map(row => row.RouteId) });
    } else {
      res.json({ error: 'No Such Route Exists', response: 'fail' });
    }
  } catch (error) {
    console.error("🔥 Check Route Error:", error);
    res.status(500).json({ error: "Database Query Failed" });
  }
});

// Add bus schedule
app.post('/busSchedule', async (req, res) => {
  const { routeid, driverid, starttime, esttraveltime, reservedseats, busregnno, fare } = req.body;
  try {
    console.log(`Adding schedule: Route=${routeid}, Driver=${driverid}, Bus=${busregnno}`);
    const query = "INSERT INTO BusSchedule (BusRegnNo, RouteID, DriverID, StartTime, Fare, ReservedSeats, TravelTime) VALUES (?, ?, ?, ?, ?, ?, ?)";
    await pool.query(query, [busregnno, routeid, driverid, starttime / 3600, fare, reservedseats, esttraveltime]);
    res.json({ error: '', response: 'Insertion Done into BusSchedule' });
  } catch (error) {
    console.error("🔥 Bus Schedule Error:", error);
    res.status(500).json({ error: "Insertion into BusSchedule Failed", details: error.message });
  }
});

// Get all bus registration numbers
app.get('/api/bus', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT BusRegnNo FROM BusInfo");
    res.json(rows);
  } catch (error) {
    console.error("❌ Error fetching bus data:", error);
    res.status(500).json({ error: "Failed to fetch bus registration numbers" });
  }
});

// Add driver
app.post('/driver', async (req, res) => {
  const { drivername, driverphone, age, date_of_join } = req.body;
  try {
    const query = "INSERT INTO DriverDetails (drivername, driverphone, age, date_of_join) VALUES (?, ?, ?, ?)";
    await pool.query(query, [drivername, driverphone, age, date_of_join]);
    res.json({ error: '', response: 'Driver Added Successfully' });
  } catch (error) {
    console.error("🔥 Driver Insert Error:", error);
    res.status(500).json({ error: "Driver insertion failed" });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});