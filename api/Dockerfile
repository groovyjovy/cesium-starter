FROM ruby:latest

RUN apt-get update -qq && apt-get install -y nodejs

RUN mkdir /api
WORKDIR /api

COPY Gemfile /api/Gemfile
COPY Gemfile.lock /api/Gemfile.lock

RUN gem install bundler
RUN bundle install

COPY . /api

EXPOSE 3000

CMD ["bash"]
