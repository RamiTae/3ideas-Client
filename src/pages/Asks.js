import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import qs from 'qs';
import axios from 'axios';
import AskListTemplate from '../components/ask/AskListTemplate';

axios.defaults.withCredentials = true;

class Asks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      asks: [],
      selectedCategory: '',
      keyword: ''
    };
    this.handleCategoryChange = this.handleCategoryChange.bind(this);
  }

  getCategorizedAskList = () => {
    let url = `http://localhost:5000/asks`;
    console.log(this.props)
    const category = qs.parse(this.props.location.pathname.split('/')[2]);
    console.log(Object.keys(category)[0])
    if (Object.keys(category)[0] !== 'all' && Object.keys(category)[0] && Object.keys(category)[0] !== '') {
      url = `http://localhost:5000/category/${encodeURIComponent(Object.keys(category)[0])}`;
    }
    axios.get(url)
      .then(res => {
        console.log('categorized list req success');
        this.setState({
          asks: res.data
        })
      }).catch(err => {
        console.log(err.message);
      })
  }

  // 키워드로 검색한(키워드가 존재할 때, 없으면 전체) 모든 글의 id 목록을 받음 
  getAskList = () => {
    let url = `http://localhost:5000/asks`
    console.log(this.props.location)

    // this.props.location 객체에서 search값을 객체로 뽑아주는 라이브러리 qs
    const query = qs.parse(this.props.location.search, {ignoreQueryPrefix: true});

    const regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
    let filteredQuery = query.q && query.q.replace(regExp, '');
    if ('q' in query && filteredQuery && filteredQuery !== '') {
      url = `http://localhost:5000/search?q=${encodeURIComponent(filteredQuery)}`;
    }

    axios.get(url)
      .then(res => {
        console.log('글 목록 요청 성공')
        this.setState({
          asks: res.data,
          keyword: filteredQuery || ''
        })
      }).catch(err => {
        console.log(err.message);
        // this.setState({ errorMessage: err.message });
      });
  }

  handleCategoryChange(e) {
    const value = e.target.value;
    this.setState({selectedCategory: value});
    this.props.history.push(`/category/${value}`);

    // this.getCategorizedAskList();
  }


  
  componentDidMount() {
    this.getAskList();
    this.props.changeCurrentPage('asks');
  }

  componentDidUpdate(prevProps, prevState) {
 
    if (prevProps.location.search !== this.props.location.search) {
      this.getAskList();
    }

    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.getCategorizedAskList();
    }
    
  }
  
  render() {
    const { asks, keyword } = this.state;
    const { category } = this.props;
    const { handleCategoryChange } = this;

    return (
      <>
        <div>
          <select onChange={handleCategoryChange}>
            {category.map(item => {
              const { categoryName } = item;
              return (
                categoryName === null ? 
                <option>all</option> :
                // eslint-disable-next-line react/jsx-key
                <option>{categoryName}</option>
              )
            })}
          </select>
        </div>
        <h3>{keyword !== '' ? `'${keyword}'의 검색결과` : '전체글 목록'}</h3>
        {asks.length === 0 && keyword !== '' && <p>검색결과가 없습니다.</p>}
        {asks.map(ask => <AskListTemplate key={ask.id} ask={ask} asks={asks} keyword={keyword} />)}
      </>
    );
  }
}

export default withRouter(Asks);
