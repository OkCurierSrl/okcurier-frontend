DROP TABLE IF EXISTS shipment;
DROP TABLE IF EXISTS service_pricing;
DROP TABLE IF EXISTS courier_company;

CREATE TABLE courier_company (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name_enum VARCHAR(255)
);

CREATE TABLE service_pricing (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    courier_company_id BIGINT,
    service_name VARCHAR(255),
    base_price DOUBLE,
    standard_added_price DOUBLE,
    premium_added_price DOUBLE,
    FOREIGN KEY (courier_company_id) REFERENCES courier_company(id)
);

CREATE TABLE shipment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    awb VARCHAR(255),
    curier VARCHAR(255),
    total_weight DOUBLE,
    total_weight_rechecked DOUBLE,
    app_price DECIMAL(19,2),
    email_account_owner VARCHAR(255)
);
