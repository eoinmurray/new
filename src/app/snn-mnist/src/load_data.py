from torchvision.datasets import MNIST
from torchvision import transforms
from torch.utils.data import DataLoader

def load_mnist_data(batch_size=128):
    transform = transforms.Compose([transforms.ToTensor()])
    
    # Load datasets
    train_dataset = MNIST(root=".", train=True, download=True, transform=transform)
    test_dataset = MNIST(root=".", train=False, download=True, transform=transform)
    
    # Create data loaders
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)
    
    return train_loader, test_loader