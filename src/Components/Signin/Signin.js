import React, { Component } from 'react';
import tachyons from 'tachyons';
import './Signin.css';
import { ScrollPanel } from 'primereact/scrollpanel';

class Signin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            pass: '',
            logged: false
        };
    }

    handleSubmit = (event) => {
        event.preventDefault();
        console.log(this.state);
    };

    handleChange = (event) => {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    };

    handleSignin = async (event) => {
        event.preventDefault();
        console.log("Logging in with:", this.state);

        try {
            const response = await fetch('http://localhost:3001/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: this.state.email,
                    password: this.state.pass
                })
            });

            const data = await response.json();
            console.log("Server response:", data);

            if (data.error) {
                alert("Login failed: " + data.error);
            } else {
                alert('Login Success');
                this.props.onRouteChange('home');
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("Something went wrong. Please try again.");
        }
    };

    render() {
        return (
            <div className='wrap pa2 center'>
                <div className='Headdiv'>
                    <h1 className='Heads pa3 ba b--green bg-lightest-blue'>Sign In</h1>
                </div>

                <div className='Content'>
                    <ScrollPanel style={{ width: '100%', height: '500px' }}>
                        <form onSubmit={this.handleSubmit}>
                            <h3>Welcome back again</h3>
                            
                            <div className="p-inputgroup">
                                <span className="p-inputgroup-addon" style={{ width: "120px" }}>
                                    <i className="pi pi-user">Email</i>
                                </span>
                                <input autoComplete="off" name="email" type="text" style={{ width: "200px" }} onChange={this.handleChange} />
                            </div>

                            <div className="p-inputgroup">
                                <span className="p-inputgroup-addon" style={{ width: "120px" }}>
                                    <i className="pi pi-lock">Password</i>
                                </span>
                                <input autoComplete="off" name="pass" type="password" style={{ width: "200px" }} onChange={this.handleChange} />
                            </div>

                            <input className="btn-lg btn btn-dark" type="submit" value="Signin" onClick={this.handleSignin} />
                            <input className="btn-lg btn btn-dark" type="button" style={{ marginTop: "0px" }} value="Don't have an account? Register" onClick={() => this.props.onRouteChange('register')} />
                        </form>
                    </ScrollPanel>
                </div>
            </div>
        );
    }
}

export default Signin;
