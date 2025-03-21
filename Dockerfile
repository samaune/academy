FROM yimsamaune/canvas-lms:4e1ea67
LABEL maintainer="yimsamaune"

ENV APP_HOME=/usr/src/app/

USER root

RUN apt-get install -qqy --no-install-recommends \
       nano \
       openssh-client

RUN curl https://dl.min.io/client/mc/release/linux-amd64/mc \
--create-dirs \
-o $HOME/minio-binaries/mc

RUN chmod +x $HOME/minio-binaries/mc
RUN export PATH=$PATH:$HOME/minio-binaries/
# RUN mc alias set 'lms' $S3_ENDPOINT $S3_ACCESS_KEY $S3_SECRET_KEY

RUN usermod -aG sudo docker
RUN echo '%docker ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

WORKDIR $APP_HOME
RUN mkdir -p /usr/src/repo
RUN chown -R docker:docker /usr/src/repo

USER docker

# RUN cp -r ./docker/gems ./ && cp -r ./docker/vendor ./
# RUN chmod -x $APP_HOME/vendor/QTIMigrationTool/migrate.py

# RUN rake canvas:compile_assets
# RUN rake js:gulp_rev
RUN rake js:webpack_production
RUN rake brand_configs:generate_and_upload_all 
# RUN rake canvas:cdn:upload_to_s3

# RUN cp -r ./docker/config/*.yml ./config

EXPOSE 443
EXPOSE 80
EXPOSE 3000
