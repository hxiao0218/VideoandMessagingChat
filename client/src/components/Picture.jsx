import React, { Component } from 'react';
import imgDeafault from '../images/default.jpg';

class Picture extends Component {
  constructor() {
    super();
    this.state = {
      image: imgDeafault,
    };
    this.createImage = this.createImage.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    const files = e.target.files || e.dataTransfer.files;

    if (!files.length) return;
    this.createImage(files[0]);
  }

  createImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.setState({ image: e.target.result });
    };
    reader.readAsDataURL(file);
  }

  render() {
    const {
      image,
    } = this.state;
    return (
      <div>
        <img
          src={image}
          style={{ height: '225px' }}
          alt={image}
        />
        <form onSubmit={this.onFormSubmit} encType="multipart/form-data">
          <input
            className="input_imagem_artigo"
            type="file"
            onChange={this.onChange}
          />
          <button type="submit">Submit</button>
        </form>
      </div>
    );
  }
}

export default Picture;
