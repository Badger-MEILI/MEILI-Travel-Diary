FROM mdillon/postgis:9.3

RUN apt-get update \
    && apt-get install -y build-essential git-core libv8-dev curl postgresql-server-dev-$PG_MAJOR \
    && rm -rf /var/lib/apt/lists/*

# install pgtap
ENV PGTAP_VERSION v0.95.0
RUN git clone https://github.com/theory/pgtap.git /pgtap \
    && cd /pgtap && git checkout tags/$PGTAP_VERSION \
    && make \
    && make install