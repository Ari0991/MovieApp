import React, { Component } from 'react';

import { MovieConsumer } from '../../../services/movie-service-context';
import CardItem from '../../Card-item/Card-item';
import './Card-list.css';
import * as prepareMovieCard from '../../../utilities/utilities';

const { convertDate, cutDescription, getPicture } = prepareMovieCard;

type Item = {
  title: string;
  id: number;
  rating: number;
  vote_average: number;
  release_date: string;
  genre_ids: string[];
  overview: string;
  poster_path: string;
};

export default class CardList extends Component {
  props: any;

  render() {
    const props = this.props.props;

    return (
      <div className="card__container">
        <MovieConsumer>
          {(value) =>
            props.map((item: Item) => {
              const { genreList, movieList, sessionID } = value;
              const { title, id, rating, vote_average, release_date, genre_ids, overview, poster_path } = item;

              return (
                <CardItem
                  genreList={genreList}
                  movieList={movieList}
                  sessionID={sessionID}
                  key={id + 'movie'}
                  title={title}
                  date={convertDate(release_date)}
                  tags={genre_ids}
                  description={cutDescription(overview, genre_ids)}
                  rating={Number(vote_average.toFixed(1))}
                  picture={getPicture(poster_path)}
                  id={id}
                  stars={rating}
                />
              );
            })
          }
        </MovieConsumer>
      </div>
    );
  }
}
