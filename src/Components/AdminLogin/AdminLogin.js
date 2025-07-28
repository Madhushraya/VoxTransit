import React, { Component } from 'react';
import './AdminLogin.css';
import AdminSelect from '../AdminSelect/AdminSelect';
import { ScrollPanel } from 'primereact/scrollpanel';

class AdminLogin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: '',
            pass: '',
            logged: false,
            response: {}
        };
    }

    handleChange = (event) => {
        event.preventDefault();
        const { name, value } = event.target;
        this.setState({ [name]: value });
    }

    handleSubmit = (event) => {
        event.preventDefault();
        console.log("🚀 Attempting Admin Login:", this.state);

        fetch('http://localhost:3001/adminLogin', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: this.state.user,
                password: this.state.pass
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log("🔎 Server Response:", data);
            this.setState({ response: data });

            if (data.response === 'success') {
                console.log("✅ Admin login successful!");
                this.setState({ logged: true });
            } else {
                alert("🚫 Not admin: " + JSON.stringify(data.error));
                console.log("🚫 Login Failed:", data);
            }
        })
        .catch(error => console.error("🔥 Login Fetch Error:", error));
    }

    render() {
        if (!this.state.logged) {
            return (
                <div className='wrap pa2 center'>
                    <div className='Headdiv'>
                        <h1 className='Heads pa3 ba b--green bg-lightest-blue'>Admin Login</h1>
                    </div>
                    <div className='Content'>
                        <ScrollPanel style={{ width: '100%', height: '500px' }}>
                            <form>
                                <h7> Please contact the admin office for password changes. </h7>
                                <div className="p-inputgroup">
                                    <span className="p-inputgroup-addon" style={{ width: "120px" }}>
                                        <i className="pi pi-user">Email</i>
                                    </span>
                                    <input autoComplete="off" name="user" type="text" style={{ width: "200px" }} onChange={this.handleChange} />
                                </div>
                                <div className="p-inputgroup">
                                    <span className="p-inputgroup-addon" style={{ width: "120px" }}>
                                        <i className="pi pi-user">Password</i>
                                    </span>
                                    <input autoComplete="off" name="pass" type="password" style={{ width: "200px" }} onChange={this.handleChange} />
                                </div>
                                <input className="btn-lg btn btn-dark" type="submit" value="Sign In" onClick={this.handleSubmit} />
                            </form>
                        </ScrollPanel>
                    </div>
                </div>
            );
        } else {
            return <AdminSelect />;
        }
    }
}

export default AdminLogin;
