import React, { Component } from 'react';
import PropTypes from 'prop-types';

import CardItem from '../Card-item/Card-item.js';
import './Card-list.css';

export default class CardList extends Component {
  render() {
    const { props } = this.props;

    const movieItems = props.map((item) => {
      const { title, tags, description, picture, id, date, rating, stars } = item;
      return (
        <CardItem
          key={id + 'movie'}
          id={id}
          title={title}
          tags={tags}
          description={description}
          date={date}
          rating={rating}
          picture={picture}
          stars={stars}
        />
      );
    });

    return <div className="card__container">{movieItems}</div>;
  }

  static propTypes = {
    props: PropTypes.arrayOf(PropTypes.object),
  };
}
