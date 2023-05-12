import { format } from 'date-fns';
import { enGB } from 'date-fns/locale/en-GB/index.js';

import noImage from './img/not-found.jpg';

export const createMovie = (item) => {
  const obj = {
    title: item.title,
    date: this.convertDate(item.release_date),
    tags: item.genre_ids,
    description: this.cutDescription(item.overview, item.genre_ids),
    rating: Number(item.vote_average.toFixed(1)),
    picture: this.getPicture(item.poster_path),
    id: item.id,
    stars: item.rating,
  };
  return obj;
};

export const convertDate = (date) => {
  if (date) {
    return format(new Date(date), 'MMMM dd, yyyy', { locale: enGB });
  }
};

export const cutDescription = (text, genres) => {
  if (text.length > 180) {
    if (genres.length < 3) {
      let cutText = text.slice(0, 160).split(' ');
      cutText.pop();
      cutText = cutText.join(' ');
      return cutText + ' ...';
    } else if (genres.length >= 5) {
      let cutText = text.slice(0, 110).split(' ');
      cutText.pop();
      cutText = cutText.join(' ');
      return cutText + ' ...';
    } else {
      let cutText = text.slice(0, 140).split(' ');
      cutText.pop();
      cutText = cutText.join(' ');
      return cutText + ' ...';
    }
  }
  return text;
};

export const getPicture = (path) => {
  if (path !== null && path !== undefined) {
    return `https://image.tmdb.org/t/p/original${path}`;
  }
  return noImage;
};
