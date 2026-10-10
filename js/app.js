function invoiceApp() {
  return {
    activeTab: "details",
    unitOptions: ["pcs", "bundle", "paket", "gr", "ltr", "box"],
    itemCatalog: [],
    pendingCatalogItems: [],
    itemCatalogSaveTimer: null,

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
      documentTitle: "INVOICE",
      invoiceNumber: "",
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: "",
      showDueDate: true,
      currency: "Rp",
    },

    items: [{ description: "", qty: 1, price: 0, unit: "pcs", selectedItem: "" }],

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
          if (data.meta) this.meta = { ...this.meta, ...data.meta };
          if (data.items && data.items.length) this.items = data.items;
          if (data.adjustments) this.adjustments = data.adjustments;
        } catch (e) {
          console.warn("Failed to load saved data", e);
        }
      }

      var catalog = localStorage.getItem("invoiceItemCatalog");
      if (catalog) {
        try {
          this.itemCatalog = JSON.parse(catalog);
        } catch (e) {
          console.warn("Failed to load saved item catalog", e);
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

    saveItemCatalogDebounced() {
      clearTimeout(this.itemCatalogSaveTimer);
      this.itemCatalogSaveTimer = setTimeout(() => {
        this.pendingCatalogItems.forEach((item) => {
          if (!this.items.includes(item) || !item.description || !item.description.trim()) {
            return;
          }

          var name = item.description.trim();
          var normalizedName = name.toLowerCase();
          var existingIndex = this.itemCatalog.findIndex(function (savedItem) {
            return savedItem.name.toLowerCase() === normalizedName;
          });
          var itemRecord = {
            id: existingIndex >= 0 ? this.itemCatalog[existingIndex].id : Date.now().toString(),
            name: name,
            unit: item.unit || "pcs",
            price: Number(item.price) || 0,
          };

          if (existingIndex >= 0) {
            this.itemCatalog[existingIndex] = itemRecord;
          } else {
            this.itemCatalog.push(itemRecord);
          }

          item.selectedItem = itemRecord.id;
        });
        this.pendingCatalogItems = [];
        localStorage.setItem("invoiceItemCatalog", JSON.stringify(this.itemCatalog));
      }, 1000);
    },

    syncItemToCatalog(index) {
      var item = this.items[index];
      if (!item) {
        return;
      }

      if (item.description && item.description.trim() && !this.pendingCatalogItems.includes(item)) {
        this.pendingCatalogItems.push(item);
      }

      this.save();
      this.saveItemCatalogDebounced();
    },

    removeSavedItem(id) {
      clearTimeout(this.itemCatalogSaveTimer);
      this.pendingCatalogItems = this.pendingCatalogItems.filter(function (item) {
        return item.selectedItem !== id;
      });
      this.itemCatalog = this.itemCatalog.filter(function (item) {
        return item.id !== id;
      });
      this.items.forEach(function (item) {
        if (item.selectedItem === id) {
          item.selectedItem = "";
        }
      });
      this.save();
      this.saveItemCatalogDebounced();
    },

    applySavedItem(index) {
      var item = this.items[index];
      if (!item || !item.selectedItem) {
        return;
      }

      var selectedItem = this.itemCatalog.find(function (savedItem) {
        return savedItem.id === item.selectedItem;
      });

      if (!selectedItem) {
        return;
      }

      item.description = selectedItem.name;
      item.unit = selectedItem.unit || "pcs";
      item.price = selectedItem.price || 0;
      this.save();
    },

    useSavedItem(savedItem) {
      this.items.push({
        description: savedItem.name,
        qty: 1,
        price: savedItem.price || 0,
        unit: savedItem.unit || "pcs",
        selectedItem: savedItem.id,
      });
      this.save();
    },

    addItem() {
      this.items.push({ description: "", qty: 1, price: 0, unit: "pcs", selectedItem: "" });
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
      var number = Number(value) || 0;
      return new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(this.roundMoney(number));
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
      this.meta = {
        documentTitle: "INVOICE",
        invoiceNumber: "",
        issueDate: new Date().toISOString().slice(0, 10),
        dueDate: "",
        showDueDate: true,
        currency: "Rp",
      };
      this.items = [{ description: "", qty: 1, price: 0, unit: "pcs", selectedItem: "" }];
      this.adjustments = { taxRate: 0, discountRate: 0, notes: "" };
      this.activeTab = "details";
    },
  };
}
