import { getSession } from 'next-auth/client';

export default async (req, res) => {
  const session = await getSession({ req });
  if (session) {
    res.status(200).json({ email: session.user.email });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
