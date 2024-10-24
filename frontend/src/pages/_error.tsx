import NextError from 'next/error';
import React from 'react';

function Error({ statusCode }) {
  return (
    <p>
      {Number.isSafeInteger(statusCode) ? (
        <NextError statusCode={statusCode} />
      ) : (
        'An error occurred on client'
      )}
    </p>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
