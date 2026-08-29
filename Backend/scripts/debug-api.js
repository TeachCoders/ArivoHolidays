import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();
const client = wrapper(axios.create({ jar, withCredentials: true }));

async function test() {
  try {
    // 1. Login
    const loginRes = await client.post('http://localhost:5000/auth/login', {
      email: 'rajnishbharti09@gmail.com', // wait, do I know a valid user? I can just create one or query the DB.
      password: 'password'
    });
  } catch (e) {
    console.error(e.message);
  }
}
test();
