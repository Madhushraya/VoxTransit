import React, { Component } from 'react';
import './AdminForms.css';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import TimePicker from 'react-bootstrap-time-picker';
import tachyons from 'tachyons';
import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { InputTextarea } from 'primereact/inputtextarea';
import { RadioGroup, RadioButton, ReversedRadioButton } from 'react-radio-buttons';
import { Calendar } from 'primereact/calendar';

class AdminForm extends Component {
  constructor(props) {
    super(props);

    let today = new Date();
    let month = today.getMonth();
    let year = today.getFullYear();
    let prevMonth = month === 0 ? 11 : month - 1;
    let prevYear = prevMonth === 11 ? year - 1 : year;
    let nextMonth = month === 11 ? 0 : month + 1;
    let nextYear = nextMonth === 0 ? year + 1 : year;

    let minDate = new Date();
    minDate.setMonth(prevMonth + 1);
    minDate.setFullYear(prevYear);

    let maxDate = new Date();
    maxDate.setMonth(0);
    maxDate.setFullYear(year - 60);

    this.state = {
      minDate: maxDate,
      maxDate: minDate,
      // Arrays for dropdown options
      existingRoutes: [], // Will store option objects
      existingDrivers: [], // Will store option objects
      existingBuses: [], // Will store option objects
      existingAgency: [], // Will store option objects
      // Selected values
      selectedRoute: null,
      selectedDriver: null,
      selectedBus: null,
      selectedAgency: null,
      // Form fields
      stateid: '',
      routeid: '',
      driverid: '',
      starttime: '',
      endtime: '',
      esttraveltime: '',
      reservedseats: '',
      busregnno: '',
      busregnnoo: '',
      agencyaddr: '',
      agencyname: '',
      capacity: 0,
      ac: 0,
      doj: '',
      drivername: '',
      driverphone: '',
      driverage: '',
      fare: 0,
      response: {},
      response2: {},
      response3: {}
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleSubmit = (event) => {
    event.preventDefault();
    console.log(this.state);
    if (this.state.user === 'a' && this.state.pass === 'p')
      this.setState({ logged: true });
  }

  handleSubmit1 = (event) => {
    event.preventDefault();
    
    // Use the selected values from dropdowns
    const routeId = this.state.routeid;
    const driverId = this.state.driverid;
    const busRegnNo = this.state.busregnnoo;
    
    console.log("Submitting Bus Schedule:", {
      routeid: routeId,
      driverid: driverId,
      busregnno: busRegnNo,
      starttime: this.state.starttime,
      esttraveltime: this.state.esttraveltime,
      reservedseats: this.state.reservedseats,
      fare: this.state.fare
    });

    fetch('http://localhost:3001/busSchedule', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        routeid: routeId,
        driverid: driverId,
        starttime: this.state.starttime,
        busregnno: busRegnNo,
        esttraveltime: this.state.esttraveltime,
        reservedseats: this.state.reservedseats,
        fare: this.state.fare
      })
    })
      .then(res => res.json())
      .then(data => { 
        console.log("Bus Schedule Response:", data);
        this.setState({ response: data });
        
        if (data.error === "") {
          alert('Record insertion done');
        } else {
          alert("Error inserting. Please follow all restrictions: " + JSON.stringify(data.error));
        }
      })
      .catch(err => console.error("Error submitting bus schedule:", err));
  }

  handleSubmit2 = (event) => {
    event.preventDefault();
    
    const busRegnNo = this.state.stateid + this.state.busregnno;
    
    console.log("Submitting Bus Details:", {
      busregnno: busRegnNo,
      agencyaddr: this.state.agencyaddr,
      agencyname: this.state.agencyname,
      capacity: this.state.capacity,
      ac: this.state.ac
    });

    fetch('http://localhost:3001/bus', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        busregnno: busRegnNo,
        agencyaddr: this.state.agencyaddr,
        agencyname: this.state.agencyname,
        capacity: this.state.capacity,
        ac: this.state.ac
      })
    })
      .then(res => res.json())
      .then(data => { 
        console.log("Bus Details Response:", data);
        this.setState({ response2: data });
        
        if (data.error === '') {
          alert('Record insertion done');
        } else {
          alert("Error inserting. Please follow all restrictions: " + JSON.stringify(data.error));
        }
      })
      .catch(err => console.error("Error submitting bus details:", err));
  }

  handleSubmit3 = (event) => {
    event.preventDefault();

    console.log("Submitting Driver Info:", {
      drivername: this.state.drivername,
      driverphone: this.state.driverphone,
      age: this.state.driverage,
      date_of_join: this.state.doj instanceof Date ? this.state.doj.toISOString().split('T')[0] : this.state.doj
    });

    fetch('http://localhost:3001/driver', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        drivername: this.state.drivername,
        driverphone: this.state.driverphone,
        age: this.state.driverage,
        date_of_join: this.state.doj instanceof Date ? this.state.doj.toISOString().split('T')[0] : this.state.doj
      })
    })
      .then(res => res.json())
      .then(data => { 
        console.log("Driver Info Response:", data);
        this.setState({ response3: data });
        
        if (data.error === '') {
          alert('Record insertion done');
        } else {
          alert("Error inserting. Please follow all restrictions: " + JSON.stringify(data.error));
        }
      })
      .catch(err => console.error("Error submitting driver info:", err));
  }

  handleClick1 = () => {
    this.speak("Add a Bus Schedule to existing routes");
  }

  handleClick2 = () => {
    this.speak("Add new Bus Details");
  }

  handleClick3 = () => {
    this.speak("View Transaction Logs");
  }

  componentDidMount() {
    // Fetch routes and format properly
    fetch('http://localhost:3001/RouteId')
      .then(res => res.json())
      .then(data => {
        // Debug the raw response
        console.log("Raw RouteId data:", data);
        
        // Make sure we're working with an array
        if (!Array.isArray(data)) {
          console.error("Routes data is not an array:", data);
          return;
        }
        
        // Create array of route options with proper format for dropdown
        const routeOptions = data.map(route => ({
          label: `Route ID: ${route}`,
          value: route
        }));
        this.setState({ existingRoutes: routeOptions });
      })
      .catch((err) => { 
        console.error("Error fetching routes:", err); 
      });

    // Fetch buses and format properly
    fetch('http://localhost:3001/buses')
      .then(res => res.json())
      .then(data => {
        // Debug the raw response
        console.log("Raw buses data:", data);
        
        // Make sure we're working with an array
        if (!Array.isArray(data)) {
          console.error("Bus data is not an array:", data);
          return;
        }
        
        // Create array of bus options with proper format for dropdown
        const busOptions = data.map(bus => ({
          label: `Bus: ${bus}`,
          value: bus
        }));
        this.setState({ existingBuses: busOptions });
      })
      .catch((err) => { 
        console.error("Error fetching buses:", err); 
      });

    // Fetch drivers and format properly
    fetch('http://localhost:3001/drivers')
      .then(res => res.json())
      .then(data => {
        // Debug the raw response
        console.log("Raw Drivers data:", data);
        
        // Make sure we're working with an array
        if (!Array.isArray(data)) {
          console.error("Driver data is not an array:", data);
          return;
        }
        
        // Create array of driver options with proper format for dropdown
        const driverOptions = data.map(driver => ({
          label: `Driver ID: ${driver}`,
          value: driver
        }));
        this.setState({ existingDrivers: driverOptions });
      })
      .catch((err) => { 
        console.error("Error fetching drivers:", err); 
      });

    // Fetch agencies
    fetch('http://localhost:3001/Agencies')
      .then(res => res.json())
      .then(data => {
        // Debug the raw response
        console.log("Raw Agencies data:", data);
        
        // Make sure we're working with an array
        if (!Array.isArray(data)) {
          console.error("Agency data is not an array:", data);
          return;
        }
        
        // Format agencies for dropdown
        const agencyOptions = data.map(agency => ({
          label: agency,
          value: agency
        }));
        this.setState({ existingAgency: agencyOptions });
      })
      .catch((err) => console.error("Error fetching agencies:", err));

    // Fetch COST data for logs
    if (this.props.reason === 'logs') {
      fetch('http://localhost:3001/COST')
        .then(res => res.json())
        .then(data => {
          console.log("Cost data:", data);
          if (data && data[0] && data[0][0]) {
            this.setState({ COST: data[0][0].totalrevenue || 0 });
          }
        })
        .catch(err => console.error("Error fetching cost data:", err));
    }
  }

  handleChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  }

  render() {
    const options = ["TN", "KL", "KA", "TS", "AP"];
    const optionsage = [];
    for (var i = 30; i <= 60; i++)
      optionsage.push(i);

    return (
      <div className="Ap bg-green pa3">
        {
          (this.props.reason === "busschedule") ?
            (
              <div className='formwarpx pa2 ma2 shadow-2 center'>
                <div className='bg-gold pa3 ma2'>
                  <span className='bg-gold'>Add Bus Schedule</span>
                </div>
                
                {/* Route Dropdown - Corrected format */}
                <div className='FormGroup'>
                  <Dropdown 
                    options={this.state.existingRoutes} 
                    onChange={(e) => {
                      console.log("Selected Route:", e);
                      this.setState({routeid: e.value})
                    }} 
                    value={this.state.routeid ? {label: `Route ID: ${this.state.routeid}`, value: this.state.routeid} : null} 
                    placeholder="Select Route ID" 
                  />
                </div>
                
                {/* Driver Dropdown - Corrected format */}
                <div className='FormGroup'>
                  <Dropdown 
                    options={this.state.existingDrivers} 
                    onChange={(e) => {
                      console.log("Selected Driver:", e);
                      this.setState({driverid: e.value})
                    }} 
                    value={this.state.driverid ? {label: `Driver ID: ${this.state.driverid}`, value: this.state.driverid} : null} 
                    placeholder="Select Driver ID" 
                  />
                </div>
                
                {/* Bus Dropdown - Corrected format */}
                <div className='FormGroup'>
                  <Dropdown 
                    options={this.state.existingBuses} 
                    onChange={(e) => {
                      console.log("Selected Bus:", e);
                      this.setState({busregnnoo: e.value})
                    }} 
                    value={this.state.busregnnoo ? {label: `Bus: ${this.state.busregnnoo}`, value: this.state.busregnnoo} : null} 
                    placeholder="Select Bus Registration Number" 
                  />
                </div>

                <div className='FormGroup'>
                  <span className='Subheads'>Enter Journey Start Time:</span>
                  <TimePicker 
                    style={{width:"200px",margin:"0 auto"}} 
                    name='starttime' 
                    onChange={(e) => {this.setState({starttime: e}, () => console.log(this.state))}} 
                    start="0:00" 
                    end="24:00" 
                    step={30} 
                  />
                </div>

                <div className='FormGroup'>
                  <span className='Subheads'>Enter Journey Fare:</span>
                  <input 
                    id="uid" 
                    autoComplete='off' 
                    pattern="^([1-9][0-9]{0,3}|10000)$" 
                    className='Boxesx' 
                    type='text' 
                    onChange={this.handleChange} 
                    required 
                    name='fare' 
                    placeholder='Fare'
                  />
                </div>

                <div className='FormGroup'>
                  <span className='Subheads'>Estimated Travel Time(in hrs.):</span>
                  <input 
                    id="uid" 
                    autoComplete='off' 
                    pattern="^(1[0-5]|[1-9])$" 
                    className='Boxesx' 
                    type='text' 
                    onChange={this.handleChange} 
                    required 
                    name='esttraveltime' 
                    placeholder='Estimated Travel Time'
                  />

                  <div className='FormGroup'>
                    <span className='Subheads'>Reserved Seats:</span>
                    <input 
                      id="uid" 
                      autoComplete='off' 
                      pattern="^(4[0]|3[0-9]|2[0-9]|1[0-9]|[0-9])$" 
                      className='Boxesx' 
                      type='text' 
                      onChange={this.handleChange} 
                      required 
                      name='reservedseats' 
                      placeholder='Reserved Seats'
                    />
                  </div>

                  <input 
                    className="btn-lg btn btn-dark xysa" 
                    type="button" 
                    value="Submit" 
                    onClick={this.handleSubmit1}
                  />
                </div>
              </div>
            )
            : (this.props.reason === "buses") ?
              (
                <div className='formwarpx pa2 ma2 shadow-2 center'>
                  <div className='bg-gold pa3 ma2'>
                    <span className='bg-gold'>Add New Bus</span>
                  </div>

                  <span className='Subheadss'>Enter Bus Regn No.:</span>
                  <div style={{marginLeft:"40px",width:"60px",display:"flex"}}>
                    <Dropdown   
                      options={options.map(option => ({label: option, value: option}))} 
                      onChange={(e) => {this.setState({stateid: e.value})}} 
                      value={this.state.stateid ? {label: this.state.stateid, value: this.state.stateid} : null}
                      placeholder="State"
                    />
                    <div className='FormGroups'>
                      <input 
                        id="uid" 
                        style={{height:"40px"}} 
                        autoComplete='off' 
                        pattern="\d{8}" 
                        className='Boxesx' 
                        type='text' 
                        required 
                        onChange={this.handleChange} 
                        name='busregnno' 
                        placeholder='Bus Registration Number'
                      />
                    </div>
                  </div>

                  <div className='FormGroup'>
                    <span className='Subheads'>Enter Agency Name:</span><br/>
                    <Dropdown 
                      options={this.state.existingAgency} 
                      onChange={(e) => this.setState({ agencyname: e.value })}  
                      value={this.state.agencyname ? {label: this.state.agencyname, value: this.state.agencyname} : null}  
                      placeholder="Select an agency"
                    />
                  </div>
                  
                  <div className='FormGroup'>
                    <span className='Subheads'>Enter Agency Address:</span>
                    <input 
                      id="uid" 
                      autoComplete='off' 
                      className='Boxesx' 
                      type='text' 
                      onChange={this.handleChange} 
                      required 
                      name='agencyaddr' 
                      placeholder='Agency Address'
                    />
                  </div>

                  <div className='FormGroup'>
                    <span className='Subheads'>Total Capacity:</span>
                    <input 
                      id="uid" 
                      autoComplete='off' 
                      pattern="^(4[0]|3[0-9]|2[0-9]|1[0-9]|[0-9])$" 
                      className='Boxesx' 
                      type='text' 
                      onChange={this.handleChange} 
                      required 
                      name='capacity' 
                      placeholder='Total Capacity'
                    />
                  </div>

                  <div className='FormGroup'>
                    <span className='Subheads'>AC Available(Yes/No)?</span>
                    <RadioGroup 
                      name='ac' 
                      style={{color:"#c71c1c",background:"#ffffff",margin:"0 auto",width:"150px",display:"flex"}} 
                      horizontal
                    >
                      <RadioButton 
                        iconSize={25} 
                        iconInnerSize={12} 
                        rootColor="#00ff00" 
                        pointColor="#00ff00" 
                        value="yes" 
                        onClick={(e) => {this.setState({ac: 1})}}
                      >
                        Yes
                      </RadioButton>
                      <RadioButton 
                        iconSize={25} 
                        iconInnerSize={12} 
                        rootColor="#c71c1c" 
                        pointColor="#c71c1c" 
                        value="no" 
                        onClick={(e) => {this.setState({ac: 0})}}
                      >
                        No
                      </RadioButton>
                    </RadioGroup>
                  </div>
                  <input 
                    className="btn-lg btn btn-dark xysa" 
                    type="submit" 
                    value="Submit" 
                    onClick={this.handleSubmit2} 
                  />
                </div>
              ) :
              (this.props.reason === "logs") ?
                (
                  <div className='formwarpx pa2 ma2 shadow-2 center'>
                    <div className='bg-gold pa3 ma2'>
                      <span className='bg-gold'>Total Revenue</span>
                    </div>
                    <div className='FormGroup'>
                      <span className='Subheads'>Total Revenue Earned</span>
                      <input 
                        autoComplete='off' 
                        className='Boxes' 
                        type='text' 
                        value={this.state.COST || "Loading..."}
                        required 
                        name='COST' 
                        disabled
                      />
                    </div>
                  </div>
                ) :
                (this.props.reason === "driverinfo") ?
                  (
                    <div className='formwarpx pa2 ma2 shadow-2 center'>
                      <div className='bg-gold pa3 ma2'>
                        <span className='bg-gold'>Add New Driver</span>
                      </div>

                      <div className='FormGroup'>
                        <span className='Subheads'>Enter Driver Name:</span>
                        <input 
                          style={{width:"300px",height:"30px"}} 
                          autoComplete='off' 
                          className='Boxesx' 
                          type='text' 
                          onChange={this.handleChange} 
                          required 
                          name='drivername' 
                          placeholder='Driver Name'
                        />
                      </div>

                      <div className='FormGroup'>
                        <span className='Subheads'>Enter Driver Age:</span>
                        <Dropdown   
                          options={optionsage.map(age => ({label: `AGE: ${age}`, value: age}))} 
                          onChange={(e) => {this.setState({driverage: e.value})}} 
                          value={this.state.driverage ? {label: `AGE: ${this.state.driverage}`, value: this.state.driverage} : null}
                          placeholder="Select Age"
                        />
                      </div>

                      <div className='FormGroup'>
                        <span className='Subheads'>Enter Date of Joining:</span>
                        <Calendar 
                          dateFormat="dd/mm/yy" 
                          value={this.state.doj} 
                          minDate={this.state.minDate}
                          maxDate={this.state.maxDate}
                          onChange={(e) => this.setState({doj: e.value}, () => console.log(this.state))} 
                          showIcon={true} 
                        />
                      </div>

                      <div className='FormGroup'>
                        <span className='Subheads'>Enter Driver Phone no.</span>
                        <input 
                          style={{width:"300px",height:"30px"}} 
                          autoComplete='off' 
                          className='Boxesx' 
                          id="uid" 
                          pattern="\d{10}" 
                          type='text' 
                          onChange={this.handleChange} 
                          required 
                          name='driverphone' 
                          placeholder='Driver Phone'
                        />
                      </div>
                      <input 
                        className="btn-lg btn btn-dark" 
                        type="submit" 
                        value="Submit" 
                        onClick={this.handleSubmit3}
                      />
                    </div>
                  ) :
                  <p>ERROR 404</p>
        }
      </div>
    );
  }
}

export default AdminForm;