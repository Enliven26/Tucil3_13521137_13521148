class PriorityQueue {
    // TODO using max heap
    constructor() {
        this.values = [];
    }

    push(element) {
        this.values.push(element);
        this.values.sort((a, b) => b[0] - a[0]);
    }

    top() {
        return this.values[this.values.length - 1];
    }

    pop() {
        this.values.pop();
    }

    isEmpty() {
        return this.values.length === 0;
    }
    
}

export {PriorityQueue};