import { Redirect } from 'expo-router';

/** `/` lands in `(app)`; send the signed-in user to the Home tab. */
export default function AppIndex() {
  return <Redirect href="/home" />;
}
