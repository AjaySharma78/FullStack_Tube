import mongoConnection from './db/config.js';
import {app} from './app.js';
import config from './env/config.js';
mongoConnection();

app.listen(config.port, () => {
  console.log('Server running on port ' + config.port);
});
