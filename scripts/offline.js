var storage = new Storage();

function Storage() {
    if (!this instanceof Storage) return new Storage();
    var isOnline = () => {
        return navigator.onLine;
    }

    function setupLocalStore() {
        if (localStorage.length) {
            var locStore = localStorage.getItem('storage');
            return (locStore && locStore.length) ? JSON.parse(locStore) : [];
        }
        else {
            localStorage.setItem('storage', []);
            return [];
        }
    }

    this.save = (entry) => {
        if (isOnline()) {
            alert(entry + ' will be posted');
        }
        else {
            this.localStore.push(entry);
            localStorage.setItem('storage', JSON.stringify(this.localStore));
        }
    }
    this.localStore = setupLocalStore();

    return this;
}