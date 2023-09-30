import { Request, Response } from 'express';
import { readConfiguration } from './config.utils';

export async function basicAuthHandler(params: {
  req: Request;
  res: Response;
  handler: () => Promise<void>;
}) {
  const { req, res, handler } = params;
  const { basicAuthSecret, projectKey } = readConfiguration();
  const allowedCredentials = [
    { username: projectKey, password: basicAuthSecret },
  ];

  const authHeader = req.headers.authorization;

  if (authHeader) {
    const credentials = authHeader.split(' ')[1];
    const decodedCredentials = Buffer.from(credentials, 'base64').toString(
      'utf-8'
    );
    const [username, password] = decodedCredentials.split(':');

    const isValidCredentials = allowedCredentials.some(
      (cred) => cred.username === username && cred.password === password
    );

    if (isValidCredentials) {
      try {
        await handler();
      } catch (error) {
        const err = error as Error;
        res.contentType('text/html');
        res.status(500);
        res.send(
          `<div>Error: ${err.message}</div> <br /> <pre>${err.stack}</pre>`
        );
      }
    } else {
      res.setHeader('WWW-Authenticate', 'Basic realm="Restricted Area"');
      res.status(401).send('Unauthorized');
    }
  } else {
    res.setHeader('WWW-Authenticate', 'Basic realm="Restricted Area"');
    res.status(401).send('Unauthorized');
  }
}
