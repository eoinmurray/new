from torchvision.datasets import MNIST, FashionMNIST
from torchvision import transforms
from torch.utils.data import DataLoader

def load_mnist_data(batch_size=128, dataset='MNIST'):
    transform = transforms.Compose([transforms.ToTensor()])
    
    if dataset == 'MNIST':
        dataset = MNIST
    elif dataset == 'FashionMNIST':
        dataset = FashionMNIST

    train_dataset = dataset(root=".", train=True, download=True, transform=transform)
    test_dataset = dataset(root=".", train=False, download=True, transform=transform)

    # Create data loaders
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)
    
    return train_loader, test_loader