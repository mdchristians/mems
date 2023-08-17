declare module 'is-video' {
  import isVideo from 'is-video';

  type Params = string;

  export default function isVideo(params: Params): boolean;
}
