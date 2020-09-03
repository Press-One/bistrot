\c sushitrain;

create table defiprices (
    id BIGSERIAL PRIMARY KEY,
    currency VARCHAR NOT NULL,
    base VARCHAR NOT NULL,
    price VARCHAR NOT NULL,
    accuracy BIGINT NOT NULL,
    prices JSONB NOT NULL,
    time TIMESTAMPTZ NOT NULL
);

CREATE INDEX currency ON defiprices(currency);
CREATE INDEX base     ON defiprices(base);
CREATE INDEX price    ON defiprices(price);
CREATE INDEX accuracy ON defiprices(accuracy);
CREATE INDEX prices   ON defiprices(prices);
CREATE INDEX time     ON defiprices(time);
