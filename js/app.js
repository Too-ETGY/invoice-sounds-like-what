function invoiceApp() {
  return {
    activeTab: "details",

    sender: {
      companyName: "",
      address1: "",
      address2: "",
      email: "",
      phone: "",
      logoUrl: "",
    },

    client: {
      name: "",
      address: "",
      email: "",
    },

    meta: {
      invoiceNumber: "",
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: "",
      currency: "$",
    },

    items: [{ description: "", qty: 1, price: 0 }],

    adjustments: {
      taxRate: 0,
      discountRate: 0,
      notes: "",
    },

    init() {
      var stored = localStorage.getItem("invoiceData");
      if (stored) {
        try {
          var data = JSON.parse(stored);
          if (data.sender) this.sender = data.sender;
          if (data.client) this.client = data.client;
          if (data.meta) this.meta = data.meta;
          if (data.items && data.items.length) this.items = data.items;
          if (data.adjustments) this.adjustments = data.adjustments;
        } catch (e) {
          console.warn("Failed to load saved data", e);
        }
      }
    },

    save() {
      localStorage.setItem(
        "invoiceData",
        JSON.stringify({
          sender: this.sender,
          client: this.client,
          meta: this.meta,
          items: this.items,
          adjustments: this.adjustments,
        })
      );
    },

    addItem() {
      this.items.push({ description: "", qty: 1, price: 0 });
      this.save();
    },

    removeItem(index) {
      if (this.items.length > 1) {
        this.items.splice(index, 1);
        this.save();
      }
    },

    roundMoney(value) {
      return Math.round((value + Number.EPSILON) * 100) / 100;
    },

    formatMoney(value) {
      return this.roundMoney(value).toFixed(2);
    },

    subtotal() {
      return this.items.reduce(function (sum, item) {
        return sum + (item.qty || 0) * (item.price || 0);
      }, 0);
    },

    taxAmount() {
      return this.subtotal() * ((this.adjustments.taxRate || 0) / 100);
    },

    discountAmount() {
      return this.subtotal() * ((this.adjustments.discountRate || 0) / 100);
    },

    grandTotal() {
      return this.subtotal() - this.discountAmount() + this.taxAmount();
    },

    resetForm() {
      localStorage.removeItem("invoiceData");
      this.sender = { companyName: "", address1: "", address2: "", email: "", phone: "", logoUrl: "" };
      this.client = { name: "", address: "", email: "" };
      this.meta = { invoiceNumber: "", issueDate: new Date().toISOString().slice(0, 10), dueDate: "", currency: "$" };
      this.items = [{ description: "", qty: 1, price: 0 }];
      this.adjustments = { taxRate: 0, discountRate: 0, notes: "" };
      this.activeTab = "details";
    },
  };
}
