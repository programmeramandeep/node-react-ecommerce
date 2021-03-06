import React, { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const Register = ({ history }) => {
    const [email, setEmail] = useState("");

    const { user } = useSelector((state) => ({ ...state }));

    useEffect(() => {
        if (user && user.token) history.push("/");
    }, [history, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const config = {
            url: process.env.REACT_APP_REGISTER_REDIRECT_URL,
            handleCodeInApp: true,
        };

        await auth
            .sendSignInLinkToEmail(email, config)
            .then(() => {
                // save user email in local storage
                window.localStorage.setItem("emailForRegistration", email);
                // show success notification
                toast.success(
                    `Email is sent to ${email}. Click the link to complete your registration.`
                );
                // clear state
                setEmail("");
            })
            .catch((error) => {
                console.log(error);
                toast.error(error.message);
            });
    };

    const registerForm = () => (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <input
                    type="email"
                    className="form-control"
                    value={email}
                    placeholder="Your email"
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                />
            </div>

            <button type="submit" className="btn btn-raised btn-primary">
                Register
            </button>
        </form>
    );

    return (
        <div className="container p-5">
            <div className="row">
                <div className="col-md-6 offset-md-3">
                    <h4>Register</h4>
                    {registerForm()}
                </div>
            </div>
        </div>
    );
};

export default Register;
