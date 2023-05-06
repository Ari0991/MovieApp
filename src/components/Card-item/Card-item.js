import React, { Component } from 'react';
import { Typography, Rate, Progress, Space, Tag } from 'antd';
import PropTypes from 'prop-types';

import './Card-item.css';
import { MovieConsumer } from '../../services/movie-service-context.js';

const { Title } = Typography;

export default class CardItem extends Component {
  state = {
    error: false,
    stars: this.props.stars,
    sessionID: localStorage.sessionID,
  };

  componentDidCatch() {
    this.setState({ error: true });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.stars !== this.state.stars && localStorage.getItem('sessionID')) {
      this.sendMovieRate(this.state.stars, this.props.id);
    }
  }
  makeAltText(text) {
    return text.split(' ').slice(0, 4).join(' ');
  }

  useColor(num) {
    if (num < 4) {
      return '#E90000';
    } else if (num < 6) {
      return '#E97E00';
    } else if (num < 8) {
      return '#E9D100';
    } else {
      return '#66E900';
    }
  }

  onRate = (num) => {
    this.setState({ stars: num });
  };

  addGenres(list, ids) {
    const tags = [];
    for (let id of ids) {
      list.forEach((elem) => (elem.id === id ? tags.push(elem.name) : null));
    }
    return tags;
  }

  sendMovieRate = (rate, movieID, sessionID = this.state.sessionID) => {
    if (rate > 0) {
      this.movieList.sendMovieRate(movieID, sessionID, rate);
    } else {
      this.movieList.deleteRateMovie(movieID, sessionID);
    }
  };

  render() {
    const { title, tags, description, picture, date, rating } = this.props;
    const { stars } = this.state;
    return (
      <MovieConsumer>
        {({ genreList, movieList }) => {
          this.movieList = movieList;

          const tagList = this.addGenres(genreList, tags);
          const tagView = tagList.map((elem) => {
            return <Tag key={elem + this.state.id}>{elem}</Tag>;
          });
          const haveGenres = tagList.length > 0 ? tagView : <Tag>No genres</Tag>;

          return (
            <React.Fragment>
              <div className="card">
                <div className="card__image-container">
                  {' '}
                  <img className="card__image" src={picture} alt={this.makeAltText(title)} placeholder={'Loading...'} />
                </div>
                <div className="card__info">
                  <Title className="card__title" level={5}>
                    {title}
                  </Title>
                  <div className="card__date"> {date}</div>
                  <div className="card__tags">
                    <Space size={[0, 8]} wrap>
                      {haveGenres}
                    </Space>
                  </div>
                  <div className="card__description">{description}</div>
                  <Progress
                    className="card__progress"
                    type="circle"
                    size={30}
                    percent={rating * 10}
                    format={(percent) => percent / 10}
                    strokeColor={this.useColor(rating)}
                  />
                  <Rate allowHalf count={10} className="card__rate" value={stars} onChange={this.onRate}></Rate>
                </div>
              </div>
            </React.Fragment>
          );
        }}
      </MovieConsumer>
    );
  }

  static defaultProps = {
    title: '',
    tags: ['Genres not found'],
    description: 'No description',
    date: 'Unknown date',
    rating: 0,
  };

  static propTypes = {
    title: PropTypes.string,
    // tags: PropTypes.arrayOf(PropTypes.string),
    description: PropTypes.string,
    picture: PropTypes.string,
    id: PropTypes.number,
    date: PropTypes.string,
    rating: PropTypes.number,
  };
}
