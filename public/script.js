Vue.filter('currency', function (value) {
    return parseFloat(value).toFixed(2);
});

var app = new Vue({
  el: "#app",
  data: {
    items: [],
    loggedIn: false,
    amount: '',
    description: '',
    budget: {},
    message: '',
    overbudget: '',
    category: 'Category',
    categories: [],
    month: 'April',
    hasBudget: false,
    username: '',
    password: '',
    user: {},
  },
  created: function() {
    this.getCategories();
    this.isOverBudget();
  },
  computed: {
    totalSpent: function() {
      let total = 0;
      for (var i = 0; i < this.items.length; i++) {
        total += parseInt(this.items[i].amount);
      }
      return total;
    }
  },
  watch: {
    loggedIn: function() {
      if (this.loggedIn) {
        console.log('Login successful')
        this.getBudget();
        this.getItems();
      }
    },
    month: function() {
      this.getBudget();
      this.getItems();
    },
  },
  methods: {
    validateForm: function() {
      var success = true;
      if (this.amount === '') {
        success = false;
        document.getElementById("amountInput").style.borderColor = "red";
      }
      if (this.description === '') {
        success = false;
        document.getElementById("descriptionInput").style.borderColor = "red";
      }
      if (this.category === 'Category') {
        success = false;
        document.getElementById("categorySelect").style.borderColor = "red";
      }
      if (document.getElementById("datepicker").value === '') {
        success = false;
        document.getElementById("datepicker").style.borderColor = "red";
      }
      return success;
    },
    resetFormColor: function() {
      document.getElementById("amountInput").style.border = "1px solid #ced4da";
      document.getElementById("descriptionInput").style.border = "1px solid #ced4da";
      document.getElementById("categorySelect").style.border = "1px solid #ced4da";
      document.getElementById("datepicker").style.border = "1px solid #ced4da";
    },
    register: function() {
      axios.post("http://http://104.236.156.21:3000/api/users", {
        username: this.username,
        password: this.password,
      }).then(response => {
        this.username = '',
        this.password = '',
        this.loggedIn = true,
        this.user = response.data.user;
      }).catch(err => {
        if (err.response) {
          if (err.response.status === 403)
            alert("That username is taken");
        }
        console.log('Register failed: ', err);
      });
    },
    login: function() {
      axios.post("http://http://104.236.156.21:3000/api/login", {
        username: this.username,
        password: this.password,
      }).then(response => {
        this.username = '',
        this.password = '',
        this.loggedIn = true,
        this.user = response.data.user;
      }).catch(err => {
        if (err.response) {
          if (err.response.status === 403 || err.response.status === 400)
            alert("Invalid credentials");
        }
        console.log('Login failed: ', err);
      });
    },
    addItem: function() {

      if (!this.validateForm()) {
        return;
      }

      axios.post("http://http://104.236.156.21:3000/api/items", {
        user_id: this.user.id,
        amount: this.amount,
        description: this.description,
        category: this.category,
        date: document.getElementById('datepicker').value,
        month: this.month,
      }).then(response => {
        this.amount = "";
        this.description = "";
        this.category = "Category";
        document.getElementById('datepicker').value = "",
        this.resetFormColor();
        this.getItems();

        this.isOverBudget();

        if (this.overbudget) {
          this.getMessage();
        }

        return true;
      }).catch(err => {
        console.log(err);
      });
    },
    getItems: function() {
      axios.get("http://http://104.236.156.21:3000/api/items/" + this.user.id + '/' + this.month).then(response => {
        console.log('Getting items')
        this.items = response.data.expenses;
        this.isOverBudget();
        return true;
      }).catch(err => {
        console.log(err);
      });
    },
    fixDecimal: function(amount) {
      return amount.toFixed(2);
    },
    getCategories: function() {
      axios.get("http://http://104.236.156.21:3000/api/categories").then(response => {
        this.categories = response.data;
        return true;
      }).catch(err => {
        console.log(err);
      });
    },
    getBudget: function() {
      axios.get("http://http://104.236.156.21:3000/api/budget/" + this.user.id + '/' + this.month).then(response => {
        console.log('Getting budget')
        this.budget = response.data.budget;
        if (this.budget)
          this.hasBudget = true;
        else {
          this.hasBudget = false;
        }
        return true;
      }).catch(err => {
        console.log(err);
      });
    },
    setBudget: function() {
      axios.post("http://http://104.236.156.21:3000/api/budget/", {
        id: this.user.id,
        month: this.month,
        amount: this.budget,
      }).then(response => {
        this.budget = response.data.budget;
        this.balance = this.budget.amount;
        this.hasBudget = true;
        return true;
      }).catch(err => {
        console.log(err);
      });
    },
    deleteItem: function(item) {
      axios.delete("http://http://104.236.156.21:3000/api/items/" + item.id).then(response => {
        this.getItems();
      }).catch(err => {
        console.log(err);
      });
    },
    getMessage: function() {
      axios.get("http://http://104.236.156.21:3000/api/message").then(response => {
        this.message = response.data;
      }).catch(err => {
        console.log(err);
      });
    },
    isOverBudget: function() {
      this.overbudget = this.totalSpent > this.budget;
    }
  },

});

$( function() {
  $( "#datepicker" ).datepicker();
} );
