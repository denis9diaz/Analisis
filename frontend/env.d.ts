export {};

declare global {
  interface Window {
    API_URL: string;
  }

  namespace JSX {
    interface Element extends React.ReactElement {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
