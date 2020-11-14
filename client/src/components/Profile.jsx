import React, { Component } from 'react';
import Picture from './Picture';

class Profile extends Component {
  constructor() {
    super();
    this.state = {
      name: 'Kailun Li',
      friendscount: 10,
      birthday: `${new Date()}`,
      createdAt: `${new Date()}`,
    };
  }

  // changepassword = () => {
  //   return function () {
  //     let password = prompt("Please enter your password");
  //   };
  // };

  // deactive = () => {
  //   return function () {
  //     alert("Account deactived! Please refresh the page!");
  //   };
  // };

  render() {
    const {
      name, friendscount, birthday, createdAt,
    } = this.state;
    return (
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="card-title mb-4">
                  <div className="d-flex justify-content-start">
                    <Picture />
                    <div className="middle" style={{ width: '70%' }}>
                      <h2
                        className="d-block"
                        style={{ fontsize: '1.5rem', fontWeight: 'bold' }}
                      >
                        {name}
                      </h2>
                      <h6 className="d-block">
                        {friendscount}
                        {' '}
                        friends
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
                            <div>
                              Full Name
                            </div>
                          </div>
                          <div className="col-md-8 col-6">
                            {name}
                          </div>
                        </div>
                        <hr />
                        <div className="row">
                          <div className="col-sm-3 col-md-2 col-5">
                            <div>
                              Birthday
                            </div>
                          </div>
                          <div className="col-md-8 col-6">
                            {birthday}
                          </div>
                        </div>

                        <hr />
                        <div className="row">
                          <div className="col-sm-3 col-md-2 col-5">
                            <div>
                              Joined at
                            </div>
                          </div>
                          <div className="col-md-8 col-6">
                            {createdAt}
                          </div>
                        </div>
                        <hr />
                        <button id="change" type="button">
                          <span>Change Password</span>
                        </button>
                        <hr />
                        <button id="deactive" type="button">
                          <span>Deactive Account</span>
                        </button>
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
