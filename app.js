

/**
 * Copyright 2016, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const process = require('process'); // Required to mock environment variables

// [START app]
const format = require('util').format;
const express = require('express');
const Multer = require('multer');
const bodyParser = require('body-parser');

// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GOOGLE_CLOUD_PROJECT environment variable. See
// https://github.com/GoogleCloudPlatform/google-cloud-node/blob/master/docs/authentication.md
// These environment variables are set automatically on Google App Engine
const Storage = require('@google-cloud/storage');

// Instantiate a storage client
const storage = Storage();

const app = express();
app.set('view engine', 'pug');
app.use(bodyParser.json());

// [START config]
// Multer is required to process file uploads and make them available via
// req.files.
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // no larger than 5mb, you can change as needed.
  }
});

// A bucket is a container for objects (files).
const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET); // add like /foldername to get the folder in there too, maybe want to do this at post time
// [END config]


// SOME NOTES:
// To change object metadata use: gsutil setmeta -h "[METADATA_KEY]:[METADATA_VALUE]" gs://[BUCKET_NAME]/[OBJECT_NAME]
// like: gsutil setmeta -h "content-type:text/plain" gs://storage.danthegoodman.com/test.txt
// and make sure who ever is doing that has been set to Storage Admin in the permissions even if you are the account owner
// for using the restapi to change metadata use this: 
// https://cloud.google.com/storage/docs/viewing-editing-metadata#storage-view-object-metadata-nodejs
// Go to cloud console and make oauth client id credentials
// https://developers.google.com/adwords/api/docs/guides/authentication#webapp
// 

    // curl -X PATCH --data-binary @config.json \
    // -H "Authorization: Bearer [ACCESS TOKEN]" \
    // -H "Content-Type: application/json" \
    // "https://www.googleapis.com/storage/v1/b/[BUCKET]/o/[FILENAME]"

    // with config.json:
    // {
    //   "contentType": "text/plain"
    // }

    // or maybe just a post request to: https://developers.google.com/oauthplayground/refreshAccessToken
    // and json body of: {"token_uri":"https://www.googleapis.com/oauth2/v4/token","refresh_token":"[REFRESH_TOKEN]"}
    // The above is without setting up credentials though, might be different with credentials, just do the refresh button while watching the network data in inspect in safari, it shows info
    // But it did work without having to do custom credentials so I guess you could just not even deal with the stupid storage setting up oauth creds in the cloud console and just use that normal post request above to get new credentisl every so often




// [START form]
// Display a form for uploading files.
app.get('/', (req, res) => {
  res.render('form.pug');
});
// [END form]

// [START process]
// Process the file upload and upload to Google Cloud Storage.
//single('file')
app.post('/upload', multer.any(), (req, res, next) => { // I think use multer.array() for each function
  if (!req.files) {
    res.status(400).send('No file uploaded.');
    return;
  }

  // Create a new blob in the bucket and upload the file data.
  req.files.map(funtime => {
    const blob = bucket.file(funtime.originalname);
  const blobStream = blob.createWriteStream();

  blobStream.on('error', (err) => {
    next(err);
  });

  blobStream.on('finish', () => {
    console.log("uploaded a file");
    // The public URL can be used to directly access the file via HTTP.
    // const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
    // res.status(200).send(publicUrl);
  });
  blobStream.end(funtime.buffer);
  });
  res.status(200).send("all files uploaded!")
});
// [END process]

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END app]

module.exports = app;
