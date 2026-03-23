import Int "mo:core/Int";
import Set "mo:core/Set";
import Iter "mo:core/Iter";

persistent actor {
    public func sortAndRemoveDuplicates(array : [Int]) : async [Int] {
        let set = Set.fromIter(array.values(), Int.compare);
        Iter.toArray(Set.values(set));
    };

    public func run() : async () {
        assert ((await sortAndRemoveDuplicates([])) == []);
        assert ((await sortAndRemoveDuplicates([1])) == [1]);
        assert ((await sortAndRemoveDuplicates([1, 2, 3])) == [1, 2, 3]);
        assert ((await sortAndRemoveDuplicates([3, 2, 1])) == [1, 2, 3]);
        assert ((await sortAndRemoveDuplicates([2, 2, 1, 3, 3])) == [1, 2, 3]);
        assert ((await sortAndRemoveDuplicates([1, 1, 1, 1, 1])) == [1]);
        assert ((await sortAndRemoveDuplicates([1, -1, 1, -1, 1])) == [-1, 1]);
        assert ((await sortAndRemoveDuplicates([-2, -3, -2, -4, -1, -3, -3])) == [-4, -3, -2, -1]);
    };
};
