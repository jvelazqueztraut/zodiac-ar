import { openPopup } from 'template/utils/popup';

const share = (
  network: 'facebook' | 'twitter' | 'linkedin' | 'google',
  link = window.location.href,
  title = '',
  description = ''
) => {
  const descriptionEncoded = encodeURIComponent(description);
  const titleEncoded = encodeURIComponent(title);
  const url = encodeURIComponent(link);
  let popup: string;

  if (network === 'facebook') {
    popup = `//www.facebook.com/sharer.php?u=${url}`;
  } else if (network === 'twitter') {
    popup = `//twitter.com/intent/tweet?text=${titleEncoded}&url=${url}`;
  } else if (network === 'linkedin') {
    popup = `//www.linkedin.com/shareArticle?mini=true&url=${url}&title=${titleEncoded}&summary=${descriptionEncoded}`;
  } else if (network === 'google') {
    popup = `//plus.google.com/share?url=${url}`;
  }

  if (popup) openPopup(popup);
};

export default {
  facebook: (link?: string) => {
    share('facebook', link);
  },
  google: (link: string) => {
    share('google', link);
  },
  linkedin: (link: string, title: string, summary: string) => {
    share('linkedin', link, title, summary);
  },
  twitter: (link: string, text: string) => {
    share('twitter', link, text);
  },
};
