import React, { Component } from "react";
import Picture from "./Picture";

class Profile extends Component {
  constructor() {
    super();
    this.state = {
      name: "Kailun Li",
      locked: "Public",
      friendscount: 10,
      birthday: "" + new Date(),
      created_at: "" + new Date(),
      info: true
    };
  }

  changepassword = () => {
    return function () {
      let password = prompt("Please enter your password");
    };
  };

  deactive = () => {
    return function () {
      alert("Account deactived! Please refresh the page!");
    };
  };

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="card-title mb-4">
                  <div className="d-flex justify-content-start">
                    <Picture />
                    <div className="middle" style={{ width: "70%" }}>
                      <h2
                        className="d-block"
                        style={{ fontsize: "1.5rem", fontWeight: "bold" }}
                      >
                        {this.state.name}
                      </h2>
                      <h6 className="d-block">
                        {this.state.friendscount} friends
                      </h6>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <h3>
                      Basic Info
                    </h3>

                    <div className="tab-content ml-1" id="myTabContent">
                      <div
                        className="tab-pane fade show active"
                        id="basicInfo"
                        role="tabpanel"
                        aria-labelledby="basicInfo-tab"
                      >
                        <div className="row">
                          <div className="col-sm-3 col-md-2 col-5">
                            <label style={{ fontWeight: "bold" }}>
                              Full Name
                            </label>
                          </div>
                          <div className="col-md-8 col-6">
                            {this.state.name}
                          </div>
                        </div>
                        <hr />
                        <div className="row">
                          <div className="col-sm-3 col-md-2 col-5">
                            <label style={{ fontWeight: "bold" }}>
                              Birthday
                            </label>
                          </div>
                          <div className="col-md-8 col-6">
                            {this.state.birthday}
                          </div>
                        </div>
 
                        <hr />
                        <div className="row">
                          <div className="col-sm-3 col-md-2 col-5">
                            <label style={{ fontWeight: "bold" }}>
                              Joined at
                            </label>
                          </div>
                          <div className="col-md-8 col-6">
                            {this.state.created_at}
                          </div>
                        </div>

                        <hr />
                        <button type="change password" onClick={this.changepassword()}>
                          Change Password
                        </button>
                        <hr />
                        <button type="deactivate" onClick={this.deactive()}>Deactive Account</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Profile;
