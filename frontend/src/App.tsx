import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

interface Urls
{
  full: string,
  short: string
}

type UrlState = {
  url: string,
  list: Urls[]
}


const UrlList = (props: {urls: Urls[]}) =>  {
  const {urls} = props;

  console.log(urls);
  
  return <table className="table table-striped table-responsive">
  <thead>
    <tr>
      <th>Full URL</th>
      <th>Short URL</th>
    </tr>
  </thead>
  <tbody>
    {urls.map((url) =>
        <tr key={Math.random()}>
            <td><a href={url.full} target="_blank" rel="noopener noreferrer">{url.full}</a></td>
            <td><a href={`http://localhost:5000/${url.short}`}  target="_blank" rel="noopener noreferrer">short.url/{url.short}</a></td>
        </tr>
    )}
  </tbody>
</table>
}

class App extends Component<{}, UrlState> {

  state: UrlState = {
    url: '',
    list: []
  };

  onChange = (e: React.FormEvent<HTMLInputElement>): void => {
    this.setState({ url: e.currentTarget.value });
  };

  handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (this.state.url.length === 0) {
      return;
    }
    
    axios.post<any>('http://localhost:5000/api/shortUrls', {full: this.state.url})
    .then(response => {
      if(response.data.success){
        console.log(response.data.success);
        this.setState({  list: [...this.state.list, response.data.success] });
      }
      else{
        window.alert(response.data.error);
      }
    })
    .catch(error => console.log(error))

    this.setState({ url: '' });
  };


  componentDidMount() {
    axios.get<any>('http://localhost:5000/api/geturls')
      .then(response =>{
        this.setState({list: [...response.data.success]});
      });
  }

  public render() {
    return <div className="App">
      <div className="container">
      <h1>URL Shortner</h1>
      <form className="my-4 form-inline" onSubmit={this.handleSubmit}>
          <label htmlFor="url" className="sr-only">
            Add Url to be shortened
          </label>
          <br/>
          <input
            required
            id="url"
            type="url"
            name="url"
            placeholder="Add Url"
            onChange={this.onChange}
            value={this.state.url}
            className="form-control col mr-2"
          />
          <button className="btn btn-info" type="submit">Shorten</button>
        </form>
        <UrlList urls={this.state.list} />
    </div>
    </div>
  }
}

export default App;
