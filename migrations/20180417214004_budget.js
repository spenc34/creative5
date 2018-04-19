
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('budget', function(table) {
      table.increments('id').primary();
      table.decimal('amount');
      table.string('month');
      table.integer('user_id').unsigned().notNullable().references('id').inTable('user');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
      knex.schema.dropTable('budget'),
  ]);
};
