\c sushitrain;

create table nodes (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR NOT NULL,
    ip         VARCHAR NOT NULL,
    p2p_port   INT NOT NULL DEFAULT 9876,
    shp_port   INT DEFAULT NULL,
    rpc_port   INT DEFAULT NULL,
    rpc_https  BOOLEAN NOT NULL DEFAULT false,
    type       VARCHAR NOT NULL DEFAULT 'THIRDPARTY',
    status     VARCHAR NOT NULL DEFAULT 'NORMAL',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX name       ON nodes(name);
CREATE INDEX ip         ON nodes(ip);
CREATE INDEX p2p_port   ON nodes(p2p_port);
CREATE INDEX shp_port   ON nodes(shp_port);
CREATE INDEX rpc_port   ON nodes(rpc_port);
CREATE INDEX rpc_https  ON nodes(rpc_https);
CREATE INDEX type       ON nodes(type);
CREATE INDEX status     ON nodes(status);
CREATE INDEX created_at ON nodes(created_at);
CREATE INDEX updated_at ON nodes(updated_at);

INSERT INTO nodes (name, ip, type, shp_port, rpc_port) VALUES ('pressonebp1', '5.135.106.40',  'FIRSTPARTY', 8080, 8888);
INSERT INTO nodes (name, ip, type, shp_port, rpc_port) VALUES ('pressonebp2', '149.56.70.124', 'FIRSTPARTY', 8080, 8888);
INSERT INTO nodes (name, ip, type, shp_port, rpc_port) VALUES ('pressonebp3', '51.38.161.232', 'FIRSTPARTY', 8080, 8888);

INSERT INTO nodes (name, ip) VALUES ('iamniuhaocom', '47.103.52.238');
INSERT INTO nodes (name, ip) VALUES ('exinpool', '52.8.93.33');
INSERT INTO nodes (name, ip) VALUES ('galaxy', '35.203.106.164');
INSERT INTO nodes (name, ip) VALUES ('liuzhe', '39.98.251.225');
INSERT INTO nodes (name, ip) VALUES ('ccpool', '39.100.47.192');
INSERT INTO nodes (name, ip) VALUES ('foxone', '54.248.154.192');
INSERT INTO nodes (name, ip) VALUES ('foxprs', '18.182.123.32');
INSERT INTO nodes (name, ip) VALUES ('freefox', '54.178.142.108');
INSERT INTO nodes (name, ip) VALUES ('ianprs', '54.178.3.36');
INSERT INTO nodes (name, ip) VALUES ('longer', '54.249.171.85');
INSERT INTO nodes (name, ip) VALUES ('odyssey', '54.248.34.226');
INSERT INTO nodes (name, ip) VALUES ('prspioneer', '49.51.11.79');
INSERT INTO nodes (name, ip) VALUES ('one', '49.51.90.175');
INSERT INTO nodes (name, ip) VALUES ('seakyrun', '47.252.85.105');
INSERT INTO nodes (name, ip) VALUES ('oceanpr', '170.106.13.180');
INSERT INTO nodes (name, ip) VALUES ('luckyone', '172.17.0.1');
INSERT INTO nodes (name, ip) VALUES ('xianrenzhang', '170.106.11.91');
INSERT INTO nodes (name, ip) VALUES ('xinhuo', '209.126.0.181');
INSERT INTO nodes (name, ip) VALUES ('weilan', '62.171.175.235');
INSERT INTO nodes (name, ip) VALUES ('baizhiheizi', '172.105.6.31');
INSERT INTO nodes (name, ip) VALUES ('tigernode', '62.171.181.215');
INSERT INTO nodes (name, ip) VALUES ('aipress', '155.138.136.102');
