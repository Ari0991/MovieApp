import React, { Component } from 'react';
import { Typography, Rate, Progress, Space, Tag } from 'antd';
import PropTypes from 'prop-types';

import './Card-item.css';

const { Title } = Typography;

export default class CardItem extends Component {
  state = {
    stars: this.props.stars,
    sessionID: this.props.sessionID,
  };

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
    const { id } = this.props;
    const { sessionID } = this.state;
    this.setState({ stars: num });

    this.sendMovieRate(num, id, sessionID);
  };

  addGenres(list, ids) {
    const tags = [];
    for (let id of ids) {
      list.forEach((elem) => (elem.id === id ? tags.push(elem.name) : null));
    }
    return tags;
  }

  sendMovieRate = (rate, movieID, sessionID) => {
    const { movieList } = this.props;

    if (rate > 0) {
      movieList.sendMovieRate(movieID, sessionID, rate);
    } else {
      movieList.deleteRateMovie(movieID, sessionID);
    }
  };

  render() {
    const { title, description, picture, date, rating, stars, tags, genreList } = this.props;

    const tagList = this.addGenres(genreList, tags);
    const tagView = tagList.map((elem) => {
      return <Tag key={elem + this.state.id}>{elem}</Tag>;
    });
    const haveGenres = tagList.length > 0 ? tagView : <Tag>No genres</Tag>;

    return (
      <React.Fragment>
        <div className="card">
          <img className="card__image" src={picture} alt={this.makeAltText(title)} placeholder={'Loading...'} />
          <div className="card__info">
            <Progress
              className="card__progress"
              type="circle"
              size={30}
              percent={rating * 10}
              format={(percent) => percent / 10}
              strokeColor={this.useColor(rating)}
            />
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

            <Rate allowHalf count={10} className="card__rate" value={stars} onChange={this.onRate}></Rate>
          </div>
        </div>
      </React.Fragment>
    );
  }
  //   );
  // }

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
