
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('user', function(table) {
      table.increments('id').primary();
      table.string('username');
      table.string('password');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('users'),
  ]);
};
