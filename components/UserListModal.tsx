import Modal from './Modal';

export default function UserListModal({
    isOpen,
    onClose,
    title,
    users,
    isLoading
}: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    users: any[];
    isLoading: boolean
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            {isLoading ? (
                <div className="text-center p-3">Loading...</div>
            ) : (
                <div className="_likes_list">
                    {users.length === 0 ? (
                        <p className="text-center text-muted">No one yet</p>
                    ) : (
                        users.map((item) => (
                            <div key={item.id} className="d-flex align-items-center mb-3">
                                <img
                                    src={item.user?.image || "/images/user.png"}
                                    alt=""
                                    style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
                                />
                                <div>
                                    <h6 style={{ margin: 0, fontSize: '14px' }}>
                                        {item.user?.firstName} {item.user?.lastName}
                                    </h6>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </Modal>
    );
}
