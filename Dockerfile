FROM node:12.13.1-alpine

# create destination directory
RUN mkdir -p /app
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
# update and install dependency
RUN apk update && apk upgrade
RUN apk add git g++ make python

# copy the app, note .dockerignore
COPY package.json /app
COPY . /app
RUN yarn 

EXPOSE 3000
EXPOSE 5432
EXPOSE 5050
# build necessary, even if no static files are needed,
# since it builds the server as well

# set app serving to permissive / assigned
ENV HOST 0.0.0.0
# set app port

# start the app
CMD yarn dev