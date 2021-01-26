\c sushitrain;

create table transactions (
    transactions_trx_id VARCHAR PRIMARY KEY,
    transactions_trx_transaction_actions_account VARCHAR,
    transactions_trx_transaction_actions_name VARCHAR,
    transactions_trx_transaction_actions_data_id VARCHAR,
    transactions_trx_transaction_actions_data_user_address VARCHAR,
    transactions_trx_transaction_actions_data_oracleservice VARCHAR,
    transactions_trx_transaction_actions_data_type VARCHAR,
    transactions_trx_transaction_actions_data__from_user VARCHAR,
    transactions_trx_transaction_actions_data__to_user VARCHAR,
    transactions_trx_transaction_actions_data__amount_quantity__amt BIGINT,
    transactions_trx_transaction_actions_data__amount_quantity__cur VARCHAR,
    transactions_trx_transaction_actions_data__dp_wd_req__id BIGINT,
    transactions_trx_transaction_actions_data__sync_auth__result BOOLEAN,
    transactions_trx_transaction_actions_data_mixin_trace_id VARCHAR,
    transactions_trx_transaction_actions_data_meta JSONB,
    transactions_trx_transaction_actions_data_data JSONB,
    transactions_trx_transaction_actions_data_data_topic VARCHAR,
    transactions_trx_transaction_actions_data_data_profile_provider VARCHAR,
    transactions_trx_transaction_actions_data_meta_uris JSONB,
    transactions_trx_transaction_actions_data_meta_mime VARCHAR,
    block_num BIGINT,
    block_id VARCHAR,
    timestamp TIMESTAMPTZ,
    producer VARCHAR,
    previous VARCHAR,
    block JSONB
);

CREATE INDEX transactions_trx_transaction_actions_account                    ON transactions(transactions_trx_transaction_actions_account);
CREATE INDEX transactions_trx_transaction_actions_name                       ON transactions(transactions_trx_transaction_actions_name);
CREATE INDEX transactions_trx_transaction_actions_data_id                    ON transactions(transactions_trx_transaction_actions_data_id);
CREATE INDEX transactions_trx_transaction_actions_data_user_address          ON transactions(transactions_trx_transaction_actions_data_user_address);
CREATE INDEX transactions_trx_transaction_actions_data_oracleservice         ON transactions(transactions_trx_transaction_actions_data_oracleservice);
CREATE INDEX transactions_trx_transaction_actions_data_type                  ON transactions(transactions_trx_transaction_actions_data_type);
CREATE INDEX transactions_trx_transaction_actions_data__from_user            ON transactions(transactions_trx_transaction_actions_data__from_user);
CREATE INDEX transactions_trx_transaction_actions_data__to_user              ON transactions(transactions_trx_transaction_actions_data__to_user);
CREATE INDEX transactions_trx_transaction_actions_data__amount_quantity__amt ON transactions(transactions_trx_transaction_actions_data__amount_quantity__amt);
CREATE INDEX transactions_trx_transaction_actions_data__amount_quantity__cur ON transactions(transactions_trx_transaction_actions_data__amount_quantity__cur);
CREATE INDEX transactions_trx_transaction_actions_data__dp_wd_req__id        ON transactions(transactions_trx_transaction_actions_data__dp_wd_req__id);
CREATE INDEX transactions_trx_transaction_actions_data__sync_auth__result    ON transactions(transactions_trx_transaction_actions_data__sync_auth__result);
CREATE INDEX transactions_trx_transaction_actions_data_mixin_trace_id        ON transactions(transactions_trx_transaction_actions_data_mixin_trace_id);
CREATE INDEX transactions_trx_transaction_actions_data_data_topic            ON transactions(transactions_trx_transaction_actions_data_data_topic);
CREATE INDEX transactions_trx_transaction_actions_data_data_profile_provider ON transactions(transactions_trx_transaction_actions_data_data_profile_provider);
CREATE INDEX transactions_trx_transaction_actions_data_meta_uris             ON transactions(transactions_trx_transaction_actions_data_meta_uris);
CREATE INDEX transactions_trx_transaction_actions_data_meta_mime             ON transactions(transactions_trx_transaction_actions_data_meta_mime);
CREATE INDEX block_num                                                       ON transactions(block_num);
CREATE INDEX block_id                                                        ON transactions(block_id);
CREATE INDEX timestamp                                                       ON transactions(timestamp);
CREATE INDEX producer                                                        ON transactions(producer);
CREATE INDEX previous                                                        ON transactions(previous);

CREATE EXTENSION pg_trgm;
CREATE INDEX i_profile_provider_jsonb_gin ON public.transactions USING gin (((transactions_trx_transaction_actions_data_data #>> '{profile_provider}'::text[])) gin_trgm_ops);
CREATE INDEX i_meta_uris_jsonb_gin        ON public.transactions USING gin (((transactions_trx_transaction_actions_data_meta #>> '{uris}'::text[])) gin_trgm_ops);
CREATE INDEX i_meta_mine_jsonb_gin        ON public.transactions USING gin (((transactions_trx_transaction_actions_data_meta #>> '{mime}'::text[])) gin_trgm_ops);
